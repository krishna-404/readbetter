const leader = require('../models/leader_model');

Function LeaderModel(){

    this.getLeader = function (req,res){
        leader_name = req.params.leader;

        res.send("success");
    }
}

