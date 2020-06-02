// const express = require('express');
// const router = express.Router();
const multer = require('multer');
const path = require('path');

const LeaderController  = require('../controllers/leaderController');


var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./images");
    },
    filename: function(req, file, callback) {

        console.log("req.body.twitter_id: ", req.body.twitter_id, "req.body.leader: ", req.body.leader, "req.body: ", req.body,"new", req.body["twitter_id"]);
        
        const fileExt = path.extname(file.originalname). toLowerCase();
        const targetName = req.body.twitter_id ? req.body.twitter_id + fileExt : file.originalname;

        callback(null, targetName);
    }
});

const upload =  multer({
    storage: Storage
})

function router(app){

    const leaderController = new LeaderController();

    app.route('/data_entry')
        .get((req,res) => {
            res.sendFile(`${process.cwd()}`+ '/views/data_entry.html');
        });

     app.route('/leader_data/:twitter_id')
         .get(leaderController.leaderList)
         .post(upload.single("leader_image"), leaderController.newLeader);
};

module.exports = router;
