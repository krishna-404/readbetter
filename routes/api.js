// const express = require('express');
// const router = express.Router();
const multer = require('multer');
const path = require('path');

const LeaderController = require('../controllers/leaderController');

var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./images");
    },
    filename: function(req, file, callback) {

        console.log("req.body.twitter_id: ", req.body.leader.twitter_id, "req.body.leader: ", req.body.leader, "req.body: ", req.body);
        const fileExt = path.extname(file.originalname). toLowerCase();
        fileName = req.body.twitter_id || file.originalname
        const targetName = fileName;

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
    //     .get(leader_controller.dispLeader)
         .post(upload.single("leader_image"), leaderController.newLeader);
};

module.exports = router;
