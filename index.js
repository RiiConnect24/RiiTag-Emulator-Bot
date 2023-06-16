const discord = require("discord.js");
const fs = require("fs");
const axios = require("axios").default;
const path = require("path");
var mysql = require("mysql");

if (!fs.existsSync("./config.json")) {
    fs.copyFileSync("./config.template.json", "./config.json");
    console.log("Update your token in config.json and restart the bot");
    process.exit();
}

const config = JSON.parse(fs.readFileSync("./config.json"));

var connection = mysql.createConnection({
  host     : config.host,
  user     : config.user,
  password : config.password,
  database : config.database
});

connection.connect();

const bot = new discord.Client({
    ws: {
        intents: [
            "GUILDS",
            "GUILD_MEMBERS",
            "GUILD_MESSAGES",
            "GUILD_MESSAGE_REACTIONS",
            "GUILD_BANS",
            "GUILD_INVITES",
            "GUILD_PRESENCES",
            "DIRECT_MESSAGES",
            "DIRECT_MESSAGE_REACTIONS"
        ]
    }
});

bot.on("ready", () => {
    console.log("Bot connected");
});

bot.on("presenceUpdate", (_, presence) => {
    presence.activities.forEach(async activity => {
        if (activity.name == "Dolphin Emulator") {
            const gameRegex = /(.*)\((.*)\)/;
            const regexRes = gameRegex.exec(activity.details);
            if (!regexRes) return;
            const gameID = regexRes[2];
            const game = regexRes[1];
            console.log(gameID);
            if (gameID.length > 6) {
                console.log(`${presence.user.username} is playing a game that isn't available on RiiTag.`);
                return;
            }
            if (gameID) {
                var key = await getKey(presence.user.id);
                console.log(key);
                if (!key) {
                    console.log(`${presence.user.username} does not have a registered account on RiiTag.`);
                    return;
                }
                var url = `http://tag.rc24.xyz/wii?key=${key}&game=${gameID}`;
                // console.log(url);
                var res = await axios.get(url);
                if (res.status == 200) {
                    console.log(`${presence.user.username} is now playing ${activity.details}.`);
                } else {
                    console.log(`Request for ${presence.user.username} failed with response code ${res.status} for game ${activity.details}.`);
                }
            } else {
                console.log("No Game ID detected");
            }
        }
        if (activity.name == "citra") {
            currGame = activity.state;
            if (currGame) {
                currGame = currGame.replace(/&/g, "%26");
                var key = await getKey(presence.user.id);
                if (!key) {
                    console.log(`${presence.user.username} does not have a registered account on RiiTag.`);
                    return;
                }

                var url = `http://tag.rc24.xyz/3ds?key=${key}&game=${currGame}`;
                //console.log(url);
                var res = await axios.get(encodeURI(url));
                if (res.status == 200) {
                    console.log(`${presence.user.username} is now playing ${activity.state}.`);
                } else {
                    console.log(`Request for ${presence.user.username} failed with response code ${res.status} for game ${activity.state}}.`);
                }
            } else {
                console.log("No Game detected");
            }
        }
        if (activity.name == "Cemu") {
            currGame = activity.state;
            if ( currGame && currGame != "Idling" ) {
                currGame = currGame.replace("Playing", "").trim().replace(/&/g, "%26");
                var key = await getKey(presence.user.id);
                if (!key) {
                    console.log(`${presence.user.username} does not have a registered account on RiiTag.`);
                    return;
                }
                var url = `http://tag.rc24.xyz/wiiu?key=${key}&game=${currGame}&source=Cemu`;
                //console.log(url);
                var res = await axios.get(encodeURI(url));
                if (res.status == 200) {
                    console.log(`${presence.user.username} is now playing ${activity.state}.`);
                } else {
                    console.log(`Request for ${presence.user.username} failed with response code ${res.status} for game ${activity.state}}.`);
                }
            } else {
                console.log("No Game detected");
            }
        }
        if (activity.name == "Yuzu") {
            currGame = activity.state;
            if ( currGame && currGame != "Currently not in game" ) {
                currGame = currGame.trim().replace(/&/g, "%26");
                var key = await getKey(presence.user.id);
                if (!key) {
                    console.log(`${presence.user.username} does not have a registered account on RiiTag.`);
                    return;
                }
                var url = `http://tag.rc24.xyz/switch?key=${key}&game=${currGame}&source=Yuzu`;
                //console.log(url);
                var res = await axios.get(encodeURI(url));
                if (res.status == 200) {
                    console.log(`${presence.user.username} is now playing ${activity.state}.`);
                } else {
                    console.log(`Request for ${presence.user.username} failed with response code ${res.status} for game ${activity.state}}.`);
                }
            } else {
                console.log("No Game detected");
            }
        }
        if (activity.name == "Ryujinx") {
            currGame = activity.state;
            if ( currGame && currGame != "Idling" ) {
                currGame = currGame.replace("Playing", "").trim().replace(/&/g, "%26");
                var key = await getKey(presence.user.id);
                if (!key) {
                    console.log(`${presence.user.username} does not have a registered account on RiiTag.`);
                    return;
                }
                var url = `http://tag.rc24.xyz/switch?key=${key}&game=${currGame}&source=Ryujinx`;
                //console.log(url);
                var res = await axios.get(encodeURI(url));
                if (res.status == 200) {
                    console.log(`${presence.user.username} is now playing ${activity.state}.`);
                } else {
                    console.log(`Request for ${presence.user.username} failed with response code ${res.status} for game ${activity.state}}.`);
                }
            } else {
                console.log("No Game detected");
            }
        }
    });
});

function saveConfig() {
    fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
}

async function getKey(id) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT randkey from `user` WHERE `username` = ?", [id], function (err, res, fields) {
           if (err) return reject(err);
           return resolve(res[0].randkey);
        });
    })
}

bot.login(config.token);
