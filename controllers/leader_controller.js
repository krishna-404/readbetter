const leader = require('../models/leader_model');

function LeaderModel(){

    this.getLeader = function (req,res){
        leader_name = req.params.leader;

        res.send("success");
    }
}

