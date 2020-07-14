const Twitter = require('twitter-lite');

function start(twitterHandle, twitterId){
    console.log("Calling twitter");
    return new Promise((resolve, reject) => {
        const client = new Twitter({
        subdomain: "api", // "api" is the default (change for other subdomains)
        version: "1.1", // version "1.1" is the default (change for other subdomains)
        consumer_key: process.env.twitter_API_key,
        consumer_secret: process.env.twitter_API_secret_key,
        access_token_key: process.env.twitter_access_token,
        access_token_secret: process.env.twitter_access_token_secret
        });

        let userdetails = {};
        if(twitterHandle){
            userdetails.screen_name = twitterHandle;
        }
        if(twitterId){
            userdetails.user_id = twitterId;
        } 

        client
        .get("users/show", userdetails)
        .then((response) => {
            console.log(response);
            resolve(response)
        })
        .catch(err => console.log(err));
    })
}

module.exports = start;