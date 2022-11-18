"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeAndPost = void 0;
const html_entities_1 = require("html-entities");
const twitter_api_v2_1 = require("twitter-api-v2");
const { API_KEY, API_KEY_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET, BEARER, } = process.env;
const twitterAppClient = new twitter_api_v2_1.TwitterApi(BEARER);
const tweetClient = new twitter_api_v2_1.TwitterApi({
    appKey: API_KEY,
    appSecret: API_KEY_SECRET,
    accessToken: ACCESS_TOKEN,
    accessSecret: ACCESS_TOKEN_SECRET
});
const readOnlyClient = twitterAppClient.readOnly;
const readWriteClient = tweetClient.readWrite;
let lastSeenTweet = undefined;
const scrapeAndPost = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const selfUser = yield readOnlyClient.v2.userByUsername("ElonsDumbAss");
    const user = yield readOnlyClient.v2.userByUsername("elonmusk");
    const selfTimeline = yield readOnlyClient.v2.userTimeline(selfUser.data.id);
    const timeline = yield readOnlyClient.v2.userTimeline(user.data.id, {
        expansions: ["attachments.poll_ids"],
        max_results: 10,
        exclude: ["replies", "retweets"],
        "poll.fields": ["id"]
    });
    lastSeenTweet = lastSeenTweet !== null && lastSeenTweet !== void 0 ? lastSeenTweet : BigInt((_d = (_c = (_b = (_a = selfTimeline.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : "0");
    const tweets = timeline.data.data;
    const tweetsSinceLastRun = tweets.filter(a => {
        return BigInt(a.id) > lastSeenTweet;
    });
    const tweetsMatchingTwitter = tweetsSinceLastRun
        .filter(a => a.text.match(/twitter/gi))
        .filter(a => { var _a; return !((_a = a.attachments) === null || _a === void 0 ? void 0 : _a.poll_ids); });
    const fixedTweets = tweetsMatchingTwitter.map(tweet => {
        let output = tweet.text;
        if (output.startsWith("Twitter")) {
            output = output.replace("Twitter", "My dumb ass");
        }
        output = output.replace(/twitter/, "my dumb ass")
            .replace(/\. Twitter/, ". My dumb ass")
            .replace(/twitter/gi, "my dumb ass");
        console.log(output, (0, html_entities_1.decode)(output));
        const newTweetText = (0, html_entities_1.decode)(output);
        return {
            newTweetText,
            tweet
        };
    });
    const latestTweets = fixedTweets.slice(0, 2);
    latestTweets.forEach(t => {
        doTweet(t).then(result => {
            console.log(result);
        });
    });
    lastSeenTweet = BigInt(timeline.data.data[0].id);
});
exports.scrapeAndPost = scrapeAndPost;
const doTweet = ({ newTweetText, tweet }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Tweeting: " + newTweetText);
    const result = yield readWriteClient.v1.tweet(newTweetText, {
        in_reply_to_status_id: tweet.id,
        auto_populate_reply_metadata: true
    });
    return result;
});
//# sourceMappingURL=scraper.js.map