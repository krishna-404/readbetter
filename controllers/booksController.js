const LeaderModel = require("../models/leaders_model");
const BookModel = require("../models/books_model");
const got = require('got');
const cheerio = require('cheerio');


function BooksController() {
  this.booksList = function(req, res) {
    res.sendFile(`${process.cwd()}` + "/views/admin/book_data_entry.html");
  };

  this.newBook = async function(req, res){
    
    let newBook;

    let booksReco = {
      book_name: req.body.book_name,
      author: req.body.author.split(","),
      ISBN13: req.body.ISBN13,
      book_desc: req.body.book_desc,
      tags: req.body.tags.split(","),
      amazonLink: req.body.amazonLink,
      bookImgPath: req.file.path,
      bookImgCredits: req.body.image_credits,
      whereRecommended: req.body.where_recommended,
      whenRecommended: req.body.when_recommended,
      leaders_comment: req.body.leaders_comment
    };

    //check if the leader exists
    let leader = await LeaderModel.findOne({
      "twitter.id": req.body.twitter_id
    }).lean();

    //return error if leader not already added
    if (!leader) return res.send("Invalid twitter id");

    //check if the book exists
    let book = await BookModel.findOne({
      $or: [
        { ISBN13: req.body.ISBN13 },
        {
          $and: [
            { book_name: req.body.book_name },
            { book_author: req.body.author.split(",") }
          ]
        }
      ]
    }).lean();
    //if book doesn't exist, add book & update in the leader DB also
    if (!book) {
      LeaderModel.findOneAndUpdate(
        { "twitter.id": req.body.twitter_id },
        {
          $set: {
            updated_on: new Date(),
            updated_by: req.connection.remoteAddress
          },
          $push: { booksReco: booksReco }
        },
        { new: true, returnOriginal: false }
      )
        .lean()
        .exec((err, doc) => {
          newBook = new BookModel({
            _id: doc.booksReco._id,
            book_name: req.body.book_name,
            book_author: req.body.author.split(","),
            ISBN13: req.body.ISBN13,
            book_desc: req.body.book_desc,
            tags: req.body.tags.split(","),
            images: [{ path: req.file.path, credits: req.body.image_credits }],
            amazonLink: req.body.amazonLink,
            reco_count: 1,
            leadersReco: [
              {
                _id: doc.leader_id,
                leader_name: doc.leader_name,
                twitter_id: req.body.twitter_id,
                whereRecommended: req.body.where_recommended,
                whenRecommended: req.body.when_recommended,
                leaders_comment: req.body.leaders_comment

              }
            ],
            created_on: new Date(),
            created_by: req.connection.remoteAddress,
            updated_on: new Date(),
            updated_by: req.connection.remoteAddress
          });
          newBook.save(function(err) {
            if (err) {
              console.log(err);
              if ((err.index = "twitter.id_1")) {
                return res.send("Duplicate ISBN");
              } else {
                return res.send("Didnot add to database.");
              }
            }
            res.send("Book created succesfuly");
          });
        });
    } else {
      //if book exists, add leader-data to book-Model & book-data to leader-Model

      //check if book exists in leader-database already
      const bookInLeaderModel = leader.booksReco.some(e => {
        const byName =
          e.book_name == req.body.book_name &&
          e.book_author == req.body.author.split(",");
        const byISBN = e.ISBN13 == req.body.ISBN13;
        return !byISBN ? byName : true;
      });

      //check if leader exists in book-database already
      const leaderInBookModel = book.leadersReco.some(e => {
        return e.twitter_id == req.body.twitter_id;
      });

      //if both are true, return entry already exists
      if (bookInLeaderModel && leaderInBookModel) {
        return res.send("Entry already exists");
      } else if (bookInLeaderModel || leaderInBookModel) {
        // by default parallel entry should be available in both database
        return res.send("Database corrupted");
      } else {
        // update book in leader-database & leader in book-database
        await LeaderModel.updateOne(
          { "twitter.id": req.body.twitter_id },
          {
            $set: {
              updated_on: new Date(),
              updated_by: req.connection.remoteAddress
            },
            $push: { booksReco: booksReco }
          }
        );

        const leadersReco = {
          leader_name: leader.leader_name,
          twitter_id: req.body.twitter_id,
          whereRecommended: req.body.where_recommended,
          whenRecommended: req.body.when_recommended,
          leaders_comment: req.body.leaders_comment
        };
        await BookModel.updateOne(
          { _id: book._id },
          {
            $set: {
              updated_on: new Date(),
              updated_by: req.connection.remoteAddress
            },
            $push: { leadersReco: leadersReco },
            $inc: { reco_count: +1 }
          }
        );

        return res.send("Succesfully updated both");
      }
    }
    
  }

  this.updateBook = async function(req, res) {


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

    let leaderUpdate = await LeaderModel.findAndUpdate({'booksReco.id' : req.body.bookId},{
                                        $set: {
                                          'booksReco.$.ISBN13': ISBN13,
                                          'booksReco.$.ISBN10': ISBN10,
                                          'booksReco.$.ASIN': ASIN
                                        }},
                                        {returnOriginal: false}).lean();

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
                                  bookTags: bookTags,
                                  clickBy: 1
                                }
                              },
                                {returnOriginal: false}
                              ).lean();
    // console.log(book);
    let book = [];
    console.log(bookUpdate);
    book.push(bookUpdate);
    res.render(
      process.cwd() + "/views/display_leader/display_allbooks.ejs",
      { data: book }
    );
    
  };
}

module.exports = BooksController;
