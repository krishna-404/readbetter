const express = require("express");

const LeaderModel = require("../models/leaders_model");
const BookModel = require("../models/books_model");

const app = express();

app.set("view engine", "ejs");

function DisplayController() {
  this.displayHome = async function(req, res) {
    // LeaderModel.find(
    //   {},
    //   "-_id -__v -updated_on -updated_by -created_on -created_by"
    // )
    //   .sort("-sort_count")
    //   .lean()
    //   .exec((err, doc) => {
    //     if (err) return res.send(err);
    //     res.render(process.cwd() + "/views/main/index.ejs", { data: doc });
    //   });
    res.render(process.cwd() + "/views/main/index.ejs");
  };

  this.displayLeader = function(req, res) {
    if (req.params.twitter_id.toLowerCase() == "admin") {
      res.sendFile(process.cwd() + "/views/admin/admin.html");
    } else if (req.params.twitter_id.toLowerCase() == "allbooks") {
      BookModel.find(
        {},
        "-_id -__v -updated_on -updated_by -created_on -created_by"
      )
        .sort("-reco_count")
        .lean()
        .exec((err, doc) => {
          res.render(
            process.cwd() + "/views/display_leader/display_allbooks.ejs",
            { data: doc }
          );
        });
    } 
    else {
      LeaderModel.findOne(
        { "twitter.id": req.params.twitter_id },
        "-_id -__v -updated_on -updated_by -created_on -created_by"
      )
        .lean()
        .exec((err, doc) => {
          if (err) return res.send(err);
          if (doc == null) return "Some Error";
          const clickByLength = doc.click_by.length
            ? doc.click_by.length / 200
            : 0;
          const sort_count = (clickByLength + 1) * doc.twitter.followers;
          LeaderModel.findOneAndUpdate(
            { "twitter.id": req.params.twitter_id },
            {
              $set: {
                sort_count: sort_count
              },
              $push: {
                click_by: req.connection.remoteAddress
              }
            },
            { new: true }
          )
            .lean()
            .exec((err, doc) => {
              if (err) return console.log(err);
              return null;
            });

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

          res.render(process.cwd() + "/views/display_leader/leader_view.ejs", {
            data: doc
          });
        });
    }
  };

  this.bookDataEntry = async function(req, res){

    let book = await BookModel.findOne({'clickBy' : []}).sort('-recoCount').lean().catch(err => res.send("error: " + err));
    // console.log(book);
    if(book){
      // console.log(book, book.bookName);
      res.render(
        process.cwd() + "/views/admin/book-data-entry.ejs",
        { data: book }
      );
    } 
  }
}

module.exports = DisplayController;
