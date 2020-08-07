const Discord = require('discord.js');
const cron = require('cron');
const fetch = require('node-fetch');
const _ = require("lodash");

const { discordToken, ncfaToken } = require('./config/secrets.json');
const { channelId, cronJb, defaultMap, defaultTimeLimit, prefix } = require('./config/const.json');
const gameModes = require('./maps/mapList.json');

const client = new Discord.Client();

const job = new cron.CronJob(cronJb, () => {
    createGame();
    // console.log(findGameMode("world"));
});

const createGame = (map = defaultMap, timeLimit = defaultTimeLimit) => {
    client.login(discordToken).then(async () => {

        const gameMode = findGameMode(map);

        const body = {
            "map": gameMode.id,
            "timeLimit": gameMode.timeLimit
        };

        const { token } = await fetch('https://www.geoguessr.com/api/v3/challenges', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Cookie': '_ncfa=' + ncfaToken
            }
        }).then(res => res.json())

        const geoChannel = client.channels.cache.get(channelId);
        const link = "https://www.geoguessr.com/challenge/" + token;
        geoChannel.send(gameMode.name + " " + gameMode.timeLimit/60 + "min " + (gameMode.timeLimit%60 !== 0 ? gameMode.timeLimit% + "sec" : ""));
        geoChannel.send(link);
    });
}

const findGameMode = (command) => {
    return _.filter(gameModes, {"command": command})[0];
}

client.on('message', message => {
    console.log("oui");
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commands = args.shift().toLowerCase();
    console.log(commands)

    // ...
});

job.start();

