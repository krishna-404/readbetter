
module.exports = function(app){
    const passport = require('passport');
    const LocalStrategy = require('passport-local');
    const bcrypt = require('bcrypt');
    const session = require('express-session');

    const LeaderModel = require("../models/leaders_model");
    
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUnintialized: true
    }))

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user.twitter.id));

    passport.deserializeUser((twitterId, done) => {
        LeaderModel.findOne({'twitter.id': twitterId}).lean()
    })

    passport.use(new LocalStrategy(
        async function(twitterId, password, done){
            let user = await LeaderModel.findOne({'twitter.id': twitterId});
            console.log('user' + twitterId + 'attempted to log in.');
            if(err) {return done(err)};
            if(!user) {return done(null, false)};
            if(!bcrypt.compareSync(password, user.pass)) {return done (null, false)};
            return done(null, user);

        }
    ))

}
