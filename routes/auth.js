
module.exports = function(app){
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const bcrypt = require('bcrypt');
    const session = require('express-session');
    const TwitterStrategy = require('passport-twitter').Strategy;

    const UserModel = require("../models/users_model");

    //Need to explore storing the session on the server data-base https://levelup.gitconnected.com/everything-you-need-to-know-about-the-passport-local-passport-js-strategy-633bbab6195
    //showing error messages using express-flash https://www.youtube.com/watch?v=-RCnNyD0L-s

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user.twitterId));

    passport.deserializeUser((twitterId, done) => {
        UserModel.findOne({twitterId: twitterId}).lean().exec((err, doc) => {
            done(null, doc);
        });
    })

    passport.use(new LocalStrategy({usernameField: 'twitterId',
                                    passwordField: 'password'}, 
        async function(twitterId, password, done){
            let user = await UserModel.findOne({twitterId: twitterId});
            console.log('user ' + twitterId + ' attempted to log in.');
            if(!user) {return done(null, false)};
            if(!bcrypt.compareSync(password, user.pass)) {return done (null, false)};
            return done(null, user);
        }
    ))

    passport.use(new TwitterStrategy({
        consumerKey: process.env.twitter_API_key,
        consumerSecret: process.env.twitter_API_secret_key,
        callbackURL: process.env.twitterCallback
    },
        async function(token, tokenSecret, profile, cb){

            let user = {
                twitterId: profile._json.id_str,
                twitterHandle: profile._json.screen_name,
                twitterName:profile._json.name,
                twitterImageUrl: profile._json.profile_image_url_https.replace("normal", "400x400"),
                followersCount: profile._json.followers_count,
                friendsCount: profile._json.friends_count,
                listedCount: profile._json.listed_count,
                twitterOAuthToken: token,
                twitterOAuthTokenSecret: tokenSecret
            }

            user = await  UserModel.findOneAndUpdate({twitterId: profile._json.id_str}, 
                                                      user, 
                                                      {upsert: true, returnOriginal: false});

            delete user.twitterOAuthToken;
            delete user.twitterOAuthTokenSecret;

            cb(null, user);
        }
    ))
}
