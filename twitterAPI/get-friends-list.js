const Twitter = require('twitter-lite');
const UserModel = require("../models/users_model");
const LeaderModel = require("../models/leaders_model");

async function start(req, res){
    console.log("start");
    let dbUser = await UserModel.findOne({twitterId: req.user.twitterId});
    console.log(req.user, "dbUser:", dbUser);


    //when new friends are followed.
    if(dbUser.friendsCount > dbUser.friendsList.length){
        dbUser = await newFriends(-1, dbUser);
        console.log("dbUser: ", dbUser);
        dbUser = await dbUser.save();
    }
    //when friends are unfollowed.


    console.log(dbUser.friendsCount, dbUser.friendsList.length, dbUser.friendsList);
    console.log(`/${dbUser.twitterHandle}/profile`);
    res.redirect(`/${dbUser.twitterHandle}/profile`);

}

var counting = 0;

function newFriends(cursor, dbUser){
    console.log("function counting:", ++counting, cursor)
    return new Promise((resolve, reject) => {
        const client = new Twitter({
            subdomain: "api", // "api" is the default (change for other subdomains)
            version: "1.1", // version "1.1" is the default (change for other subdomains)
            consumer_key: process.env.twitter_API_key,
            consumer_secret: process.env.twitter_API_secret_key,
            access_token_key: dbUser.twitterOAuthToken,
            access_token_secret: dbUser.twitterOAuthTokenSecret
        });

        client
            .get("friends/list", {
                user_id: dbUser.twitterId,
                cursor: cursor,
                count: 200,
            })
            .then(async (response) => {
                console.log("inside newFriends");
                let commonEnteries = 0;
                let nextCursor = response.next_cursor_str;

                //go through each user one by one & check with existing entry
                for(let i=0; i<response.users.length && commonEnteries < 4 ; i++){
                    // console.log(i, "step 1", response.users[i].screen_name);
                    dbUser.friendsList = dbUser.friendsList || [];
                    //if no existing entry
                    if(!dbUser.friendsList.find((o, cnt) => o.friendsTwitterId == response.users[i].id_str)){
                        // console.log("friend doesn't exist");                   
                        //find friend in leaders (we are not checking for new books in leaders count)
                        const newFriend = {
                            friendsTwitterId: response.users[i].id_str,
                            friendsTwitterHandle: response.users[i].screen_name
                        }

                        let leader = await LeaderModel.findOne({$or: [
                                                            {'twitter.id': response.users[i].id_str},
                                                            {'twitter.id': response.users[i].screen_name.toLowerCase()}
                                                        ]})
                        // if leader exists
                        if(leader){
                            newFriend.booksRecoCount = leader.booksReco.length;

                            leader.twitter.id = response.users[i].id_str;
                            leader.twitter.handle = response.users[i].screen_name;
                            console.log(leader.twitter.handle);
                            // await leader.save();

                            dbUser.friendsBooks = dbUser.friendsBooks || [];
                            const newLeader =   {
                                                leaderId: leader.id,
                                                leaderTwitterId : response.users[i].id_str,
                                                leaderTwitterHandle: response.users[i].screen_name
                                                }
                            console.log(newLeader);
                            //go through all books recommended one by one
                            for(let j=0; j<leader.booksReco.length; j++){
                                //add the book & leader details to the list

                                //beware of matching nulls & blanks
                                let bookFind = await dbUser.friendsBooks.find((o, cnt)=> {
                                                    if( o.bookId == leader.booksReco[j].id ||
                                                        o.ISBN13 == leader.booksReco[j].ISBN13 ||
                                                        o.ISBN10 == leader.booksReco[j].ISBN10 ||
                                                        o.ASIN == leader.booksReco[j].ASIN){
                                                            dbUser.friendsBooks[cnt].recommendedBy.push(newLeader);
                                                            return true;
                                                        } 
                                                })
                                console.log(bookFind);
                                if(!bookFind){
                                    const newBook = {
                                        bookId: leader.booksReco[j].id,
                                        ISBN13: leader.booksReco[j].ISBN13,
                                        ISBN10: leader.booksReco[j].ISBN10,
                                        ASIN: leader.booksReco[j].ASIN,
                                        recommendedBy: [{newLeader}]
                                    }
                                    dbUser.friendsBooks.push(newBook);
                                    console.log(dbUser.friendsBooks);
                                }
                            
                                                                 
                            }
                            //(what if user unfollows any friend. How to update that?)
                            //(what if there is a new leader)
                            
                            //add number of books recommended(if leader exists) & add friends to list.
                        }
                        dbUser.friendsList.push(newFriend);
                    } else {
                        console.log("friend exists", response.users[i].screen_name, "commonEnteries:", commonEnteries);
                        commonEnteries++;
                    }
                }
                //If count!=length & newtargetcursor>0, recall function with new target cursor
                console.log("before step 2", counting, dbUser.friendsCount, dbUser.friendsList.length );
                if(dbUser.friendsCount > dbUser.friendsList.length && Number(nextCursor)>0){
                    console.log("step 2", dbUser.friendsCount, dbUser.friendsList.length, "***************************");
                    dbUser = await newFriends(nextCursor, dbUser);
                }

                // because count == length or no further new targetcursor to scrape we return the leader
                console.log("resolve here $$$$$$$$$$$$$$$");
                resolve(dbUser);
                
                console.log("response.users: ", response.users, "response: ", response);
                // nextCursor = response.next_cursor_str;
                console.log(Number(nextCursor), typeof(Number(nextCursor)))
            })
            .catch(err => console.log(err))
    })
}

module.exports = start;