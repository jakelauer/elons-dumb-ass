import twitter from '@ambassify/twitter-text';
import { decode } from 'html-entities';
import { TweetV2, TwitterApi } from 'twitter-api-v2';

interface NewTweetObj
{
    tweet: TweetV2,
    newTweetText: string
}

const {
    API_KEY,
    API_KEY_SECRET,
    ACCESS_TOKEN,
    ACCESS_TOKEN_SECRET,
    BEARER,
} = process.env;

const twitterAppClient = new TwitterApi(BEARER);

const tweetClient = new TwitterApi({
    appKey: API_KEY,
    appSecret: API_KEY_SECRET,
    accessToken: ACCESS_TOKEN,
    accessSecret: ACCESS_TOKEN_SECRET
});

const readOnlyClient = twitterAppClient.readOnly;
const readWriteClient = tweetClient.readWrite;

let lastSeenTweet: BigInt = undefined;

export const scrapeAndPost = async () => {
    const selfUser = await readOnlyClient.v2.userByUsername("ElonsDumbAss");
    const user = await readOnlyClient.v2.userByUsername("elonmusk");

    const selfTimeline = await readOnlyClient.v2.userTimeline(selfUser.data.id);
    const timeline = await readOnlyClient.v2.userTimeline(user.data.id, {
        expansions: ["attachments.poll_ids"],
        max_results: 10,
        exclude: ["replies", "retweets"],
        "poll.fields": ["id"]
    });

    lastSeenTweet = lastSeenTweet ?? BigInt(selfTimeline.data?.data?.[0]?.id ?? "0")

    const tweets = timeline.data.data;

    const tweetsSinceLastRun = tweets.filter(a => {
        return BigInt(a.id) > lastSeenTweet
    });

    const tweetsMatchingTwitter = tweetsSinceLastRun
        .filter(a => a.text.match(/twitter/gi))
        .filter(a => !a.attachments?.poll_ids);

    const fixedTweets = tweetsMatchingTwitter.map(tweet => {
        let output = tweet.text;

        if (output.startsWith("Twitter")) {
            output = output.replace("Twitter", "My dumb ass");
        }

        output = output.replace(/twitter/, "my dumb ass")
            .replace(/\. Twitter/, ". My dumb ass")
            .replace(/twitter/gi, "my dumb ass");

        console.log(output, decode(output))

        const newTweetText = decode(output);

        return {
            newTweetText,
            tweet
        } as NewTweetObj
    });

    const latestTweets = fixedTweets.slice(0, 2);

    latestTweets.forEach(t => {
        doTweet(t).then(result => {
            console.log(result);
        })
    })

    lastSeenTweet = BigInt(timeline.data.data[0].id);
}

const doTweet = async ({newTweetText, tweet}: NewTweetObj) => {
    console.log("Tweeting: " + newTweetText);
    
    const parsed = twitter.txt.parseTweet(newTweetText);
    if(parsed.weightedLength > 275)
    {
        console.log("Skipping - too long");
        return;
    }

    const result = await readWriteClient.v1.tweet(newTweetText, {
        in_reply_to_status_id: tweet.id,
        auto_populate_reply_metadata: true
    });

    return result;
}
