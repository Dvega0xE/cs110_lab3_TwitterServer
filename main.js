// Note: Variables prefixed by a t are references to DOM elements

class Tweet {
    constructor(id, dateTweeted, userName, profilePicSrc, tweetContent) {
        this.id = id;
        this.dateTweeted = dateTweeted;
        this.userName = userName;
        this.profilePicSrc = profilePicSrc;
        this.tweetContent = tweetContent;
    }
}

let tweetList = [];

// Time in seconds before updating the tweets
const timeBetweenUpdates = 5;

// Reference to our tweet list in HTML
const tTweetList = document.getElementById("tweet_list");

// URL to fetch later
const url = "http://ec2-18-209-247-77.compute-1.amazonaws.com:3000/feed/random?q=weather";

let tweetTimer;

updateTweets();
tweetTimer = window.setInterval(updateTweets, timeBetweenUpdates * 1000);

let paused = false;

let filteredTweets = [];

//https://iq.opengenus.org/pause-javascript-code/
async function updateTweets() {
    try {
        const res = await fetch(url);
        data = await res.json();
        // Handle new data
        let statuses = data.statuses;
        for (let i = 0; i < statuses.length; ++i) {
            // Get info from data
            const id = statuses[i].id;
            const createdAt = statuses[i].created_at;
            const dateTweeted = new Date(createdAt);
            const userName = statuses[i].user.screen_name;
            const profilePicSrc = statuses[i].user.profile_image_url;
            const tweetContent = statuses[i].text;

            const tweet = new Tweet(id, dateTweeted, userName, profilePicSrc, tweetContent);

            const isDuplicate = tweetList.find(element => element.id == id);
            if (!isDuplicate) {
                // Only adding to the tweetList if this is not a duplicate
                tweetList.push(tweet);
            }
        }

        // Update tweets
        tweetList.sort(compareTweets);
        displayAllTweets(tweetList);

    }
    catch (err) {
        // Error catching
        console.log(err);
    }
}

function displayTweet(tweetObj) {
    // Add DOM elements
    const tDateTweeted = document.createElement("li");
    tDateTweeted.innerText = tweetObj.dateTweeted;

    const tUserName = document.createElement("li");
    tUserName.innerText = tweetObj.userName;

    const tProfilePicEntry = document.createElement("li");
    const tProfilePicImage = document.createElement("img");
    tProfilePicImage.src = tweetObj.profilePicSrc;
    tProfilePicEntry.appendChild(tProfilePicImage);

    tProfilePicImage.onerror = function () {
        console.log("Could not load profile picture for user " + tweetObj.userName);
    };

    const tTweetContent = document.createElement("li");
    tTweetContent.innerText = tweetObj.tweetContent;

    // Create new HTML entry for tweet
    const tTweet = document.createElement("ul");
    tTweet.style.listStyleType = "none";
    tTweet.style.padding = "10px";
    tTweet.style.border = "solid"
    tTweet.style.borderColor = "#4AB3F4"
    tTweet.style.borderRadius = "5%";
    tTweet.appendChild(tDateTweeted);
    tTweet.appendChild(tUserName);
    tTweet.appendChild(tProfilePicEntry);
    tTweet.appendChild(tTweetContent);

    tTweetList.appendChild(tTweet);
}

// Displays all the tweets stored in tweetList
function displayAllTweets(list) {
    tTweetList.innerHTML = "";
    list.forEach(element => {
        displayTweet(element);
    });
}

function compareTweets(a, b) {
    if (a.dateTweeted > b.dateTweeted) {
        return -1;
    }

    return 1;
}

let searchString = ""; // here we use a global variable

function togglePause() {
    if (paused) {
        paused = false;
        // start a new timer
        if (searchString === "") {
            updateTweets();
            tweetTimer = window.setInterval(updateTweets, timeBetweenUpdates * 1000);
        }
    }
    else {
        paused = true;
        // get rid of the timer when paused
        clearInterval(tweetTimer);
    }
}

const handleSearch = event => {
    searchString = event.target.value.toLowerCase();

    if (searchString !== "") {
        if (!paused) {
            clearInterval(tweetTimer);
        }
        // you may want to update the displayed HTML here too
        filteredTweets = tweetList.filter(containsTweet);
        displayAllTweets(filteredTweets);
    }
    else {
        displayAllTweets(tweetList);
        if (!paused) {
            tweetTimer = window.setInterval(updateTweets, timeBetweenUpdates * 1000);
        }
    }
};

document.getElementById("searchBar").addEventListener("input", handleSearch);

function containsTweet(value) {
    console.log(value)
    const lowercaseContent = value.tweetContent.toLowerCase();
    return lowercaseContent.includes(searchString);
}

const tweetContainer = document.getElementById("tweet_list");

/**
 * Removes all existing tweets from tweetList and then append all tweets back in
 *
 * @param {Array<Object>} tweets - A list of tweets
 * @returns None, the tweets will be renewed
 */
function refreshTweets(tweets) {
    // feel free to use a more complicated heuristics like in-place-patch, for simplicity, we will clear all tweets and append all tweets back
    // {@link https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript}
    while (tweetContainer.firstChild) {
        tweetContainer.removeChild(tweetContainer.firstChild);
    }

    console.log(tweets);

    // create an unordered list to hold the tweets
    // {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement}
    const tweetListEl = document.createElement("ul");
    console.log(tweetListEl);
    console.log(tweetContainer);
    // append the tweetList to the tweetContainer
    // {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild}
    tweetContainer.appendChild(tweetListEl);

    // all tweet objects (no duplicates) stored in tweets variable

    // filter on search text
    // {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter}
    const filteredResult = tweets.filter(containsTweet);
    tweetList = filteredResult;
    displayAllTweets(tweetList)

}
