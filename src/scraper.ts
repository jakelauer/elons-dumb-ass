import { decode } from 'html-entities';
import { TwitterApi } from 'twitter-api-v2';

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

    const fixedTweets = tweetsMatchingTwitter.map(a => {
        let output = a.text;

        if (output.startsWith("Twitter")) {
            output = output.replace("Twitter", "My dumb ass");
        }

        output = output.replace(/twitter/, "my dumb ass")
            .replace(/\. Twitter/, ". My dumb ass")
            .replace(/twitter/gi, "my dumb ass");

        console.log(output, decode(output))

        return decode(output);
    });

    const latestTweets = fixedTweets.slice(0, 2);

    latestTweets.forEach(t => {
        doTweet(t).then(result => {
            console.log(result);
        })
    })

    lastSeenTweet = BigInt(timeline.data.data[0].id);
}

const doTweet = async (tweetText: string) => {
    console.log("Tweeting: " + tweetText);

    const result = await readWriteClient.v1.tweet(tweetText);

    return result;
}