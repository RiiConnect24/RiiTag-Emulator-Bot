const discord = require("discord.js");
const fs = require("fs");
const axios = require("axios").default;

if (!fs.existsSync("./keys.json")) {
    fs.copyFileSync("./keys.template.json", "./keys.json");
    console.log("Update your token in keys.json and restart the bot");
    process.exit();
}

const keys = JSON.parse(fs.readFileSync("./keys.json"));

const bot = new discord.Client({
    ws: {
        intents: [
            "GUILDS",
            "GUILD_MEMBERS",
            "GUILD_MESSAGES",
            "GUILD_MESSAGE_REACTIONS",
            "GUILD_BANS",
            "GUILD_INVITES",
            "GUILD_PRESENCES"
        ]
    }
});

bot.on("ready", () => {
    console.log("Bot connected");
});

bot.on("presenceUpdate", (_, newPresence) => {
    newPresence.activities.forEach(async activity => {
        if (activity.name == "Dolphin Emulator") {
            const gameRegex = /.*\((.*)\)/;
            const regexRes = gameRegex.exec(activity.details);
            if (!regexRes) return;
            const game = regexRes[1];
            if (game) {
                var key = keys[newPresence.userID];
                var url = `http://tag.rc24.xyz/wii?key=${key}&game=${game}`;
                var res = await axios.get(url);
                if (res.status == 200) {
                    console.log(`${newPresence.user.username} is now playing ${activity.details}.`);
                }
            }
        }
    });
});

bot.on("message", async message => {
    if (message.author.bot) {
        return;
    }

    if (message.content.startsWith("^")) {
        var m = message.content.replace("^", "").split(" ");
        var c = m[0];
        var args = m.splice(1);

        if (c == "key") {
            if (!args[0]) {
                await message.reply("No key");
                return;
            }
            keys[message.author.id] = args[0];
            fs.writeFileSync("./keys.json", JSON.stringify(keys, null, 4));
            await message.reply("Done");
            return;
        }
    }
});

bot.login(keys.token);