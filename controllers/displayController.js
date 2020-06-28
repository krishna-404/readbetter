const LeaderModel = require("../models/leaders_model");
const BookModel = require("../models/books_model");

function DisplayController() {
  this.displayHome = async function(req, res) {
    LeaderModel.find(
      {},
      "-_id -__v -updatedAt -updatedBy -createdAt -createdBy"
    )
      .sort("-sortCount")
      .lean()
      .exec((err, doc) => {
        if (err) return res.send(err);

        res.render(process.cwd() + "/index.ejs", { data: doc });
      });
  };

  this.displayLeader = async function(req, res) {
    let inputId = req.params.twitter_id.toLowerCase();

    if ( inputId == "admin") {
      res.sendFile(process.cwd() + "/views/admin/admin.html");
    } else if (inputId == "books") {
      let book =  await BookModel.find(
        {},
        "-_id -__v -updatedAt -updatedBy -createdAt -createdBy"
      )
        .sort("-recoCount")
        .limit(50)
        .lean()
        .exec((err, doc) => {
          console.log(doc);
          res.render(
            process.cwd() + "/views/disp-allbooks/disp-allbooks.ejs",
            { data: doc }
          );
        });
    } 
    else {

      let books = await BookModel.find({'leadersReco.twitterId': inputId}, 
                                        'bookName bookAuthor ISBN13 ISBN10 ASIN bookTags bookImgPath amazonLink recoCount leadersReco.$')
                                        .sort('-recoCount').lean();

      let leader = await LeaderModel.findOne({'twitter.id' : inputId}, '-_id -__v -createdBy -updatedBy -createdAt -updatedAt')
                                    .lean();

      if(leader.booksReco.length != books.length){
        console.log("Book Count mismatch", leader);
      }

      let data = {leader, books};

      res.render(
        process.cwd() + "/views/disp-leader/disp-leader.ejs", {
        data: data
      });
        
    }
  };
}

module.exports = DisplayController;

//Temp data below to be deleted.


// LeaderModel.findOne(
//   { "twitter.id": inputId },
//   "-_id -__v -updatedAt -updatedBy -createdAt -createdBy"
// )
//   .lean()
//   .exec((err, doc) => {
//     if (err) return res.send(err);
//     if (doc == null) return "Some Error";
//     const clickByLength = doc.clickBy.length
//       ? doc.clickBy.length / 200
//       : 0;
//     const sort_count = (clickByLength + 1) * doc.twitter.followers;
//     LeaderModel.findOneAndUpdate(
//       { "twitter.id": req.params.twitter_id },
//       {
//         $set: {
//           sort_count: sort_count
//         },
//         $addToSet: {
//           click_by: req.connection.remoteAddress
//         }
//       },
//       { new: true }
//     )
//       .lean()
//       .exec((err, doc) => {
//         if (err) return console.log(err);
//         return null;
//       });

//           doc.booksReco.forEach(e => {
//             e.alsoRecoBy = BookModel.findOne(
//               {
//                 $or: [
//                   { ISBN13: e.ISBN13 },
//                   {
//                     $and: [
//                       { book_name: e.book_name },
//                       { book_author: e.author }
//                     ]
//                   }
//                 ]
//               },
//               { leadersReco: 1 }
//             )
//               .lean()
//               .exec((err, dat) => {
//                 if(dat == undefined) return null;
        
//                 console.log('dat: ', dat);
//                 const alsoReco = dat.map(lead => lead.leader_name);
//                 console.log('alsoReco: ', alsoReco);
//                 return alsoReco;
          
//               });
//             console.log("e.alsoRecoBy: ", e.alsoRecoBy);
//           });
