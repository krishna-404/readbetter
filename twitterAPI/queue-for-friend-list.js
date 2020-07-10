const Twitter=require('twitter');

var client = new Twitter({
    consumer_key: process.env.twitter_API_key,
    consumer_secret: process.env.twitter_API_secret_key,
    bearer_token:""
})