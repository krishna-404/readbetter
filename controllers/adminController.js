
function adminController() {
    this.bookDataEntry = async function(req, res){

        let book;
        let bookId = req.query.bookId

        if(bookId){
            book = await BookModel.findById({_id: bookId}).sort('-recoCount').lean().catch(err => res.send("error: " + err));
        } else {
            book = await BookModel.findOne({createdBy : {$exists: false}}).sort('-recoCount').lean().catch(err => res.send("error: " + err));
        }
        // console.log(book);

        if (!book.amazonLink.match(/^https\:\/\/www\.amazon\.in/)) book.amazonLink = "";
        if(book){
            // console.log(book, book.bookName);
            res.render(
            process.cwd() + "/views/admin/book-data-entry.ejs",
            { data: book }
            );
        } else {
            res.send("Book not uploaded");
        }
    }
    
    this.leaderDataEntry = async function(req,res){

        let leader;
        let leaderId = req.query.leaderId
        
        if(leaderId){
            leader = await LeaderModel.findById(leaderId).sort('-sortCount').lean().catch(err => res.send("error: "+ err));
        } else {
            leader = await LeaderModel.findOne({createdBy : {$exists: false}}).sort('-sortCount').lean().catch(err => res.send("error: "+ err));
        }
        // console.log(leader);

        leader.twitter = leader.twitter || {};

        if(leader){
            res.render(
            process.cwd() + "/views/admin/leader-data-entry.ejs",
            { data: leader }
            )
        } else {
            res.send("no leaders available")
        }
    }

    this.updatedBook = async function(req, res) {


        let ISBN10="", ISBN13="", ASIN="", bookTags = [], bookImgPath;
    
        let uri = req.body.amazonLink;
        if(uri) {
            let pos = uri.lastIndexOf('/')+1;
            uri = uri.substring(0, pos);
            await got(uri).then(uriRes => {
                let $ = cheerio.load(uriRes.body);
    
                    bookImgPath = $('#img-canvas').find('img').attr('src')
                    
                    const breadCrumbs = $('#wayfinding-breadcrumbs_feature_div a')
                    breadCrumbs.each((i, dat) => {
                      if (i!=0 && i<breadCrumbs.length){
                        bookTags.push($(dat).text().trim());
                      }
                    })
    
                    const elements = $('.content li')
                    elements.each((i, dat) => {
                        
                        let pos = $(dat).text().trim().lastIndexOf(':')+1;
    
                        if ($(dat).find('b').text() == "ISBN-10:"){
                          ISBN10 = $(dat).text().trim().substring(pos).trim(); 
                        }
                        if ($(dat).find('b').text() == "ISBN-13:"){
                          ISBN13 = $(dat).text().trim().substring(pos).trim(); 
                        }
                        if ($(dat).find('b').text() == "ASIN:"){
                          ASIN = $(dat).text().trim().substring(pos).trim(); 
                        }
                    })
            }).catch(err => {
                console.error('scrapeBooksList err: ', err);
            })
        }
    
        let leaderUpdate = await LeaderModel.updateMany({'booksReco.id' : req.body.bookId},{
                                            $set: {
                                              'booksReco.$.ISBN13': ISBN13,
                                              'booksReco.$.ISBN10': ISBN10,
                                              'booksReco.$.ASIN': ASIN
                                            }}).lean();
    
        let bookUpdate = await BookModel.findByIdAndUpdate(
                                    {_id: req.body.bookId}, {
                                      $set: {
                                      bookName: req.body.bookName,
                                      bookAuthor: req.body.bookAuthor.split(','),
                                      ISBN13: ISBN13,
                                      ISBN10: ISBN10,
                                      ASIN: ASIN,
                                      bookDesc: req.body.bookDesc,
                                      bookImgPath: bookImgPath,
                                      amazonLink: req.body.amazonLink,
                                      createdBy: req.connection.remoteAddress,
                                      updatedBy: req.connection.remoteAddress
                                    },
                                    $addToSet: {
                                      bookTags: bookTags
                                    }
                                  },
                                    {returnOriginal: false}
                                  ).lean();
        // console.log(book);
        let book = [];
        console.log(bookUpdate);
        book.push(bookUpdate);
        res.render(
          process.cwd() + "/views/admin/display-updatedBook.ejs",
          { data: book }
        );
        
    };

    this.updatedLeader = async function(req,res){
    
        // console.log(req.body);
        let ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 
                  req.connection.remoteAddress || 
                  req.socket.remoteAddress || 
                  req.connection.socket.remoteAddress;
    
        await BookModel.updateMany({'leadersReco.leaderDbId': req.body.leaderId},{
                                              $set : {
                                                'leadersReco.$.twitterId': req.body.twitter_id.toLowerCase()
                                              }
                                            });
    
        let books = await BookModel.find({'leadersReco.leaderDbId': req.body.leaderId}, 
                                        'bookName bookAuthor ISBN13 ISBN10 ASIN bookTags bookImgPath amazonLink recoCount leadersReco.$')
                                        .sort('-recoCount').lean();
          // {'leadersReco.$' : 1, _id: 0}
        console.log("book: ", books);
    
        let leader = await LeaderModel.findByIdAndUpdate(req.body.leaderId, {
                    $set: {
                      leaderName: req.body.leaderName,
                      leaderSector: req.body.leaderSector,
                      leaderBio: req.body.leaderBio,
                      leaderImgPath: req.body.leaderImgPath,
                      leaderStoryLink: req.body.leaderStoryLink,
                      'twitter.id': req.body.twitter_id.toLowerCase(),
                      'twitter.followers': req.body.twitter_followers,
                      sortCount: req.body.twitter_followers,
                      createdBy: ip,
                      updatedBy: ip
                    }
                  },
                  {returnOriginal: false}).lean();
    
        // console.log(leader);
    
        if(leader.booksReco.length != books.length){
          console.log("Book Count mismatch", leader);
        }
    
        let data = {leader, books};
        console.log(data);
    
        res.render(
          process.cwd() + "/views/admin/display-updatedLeader.ejs",
          { data: data }
        );
    }
}

module.exports = adminController;