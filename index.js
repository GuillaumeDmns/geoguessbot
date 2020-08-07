const Discord = require('discord.js');
const cron = require('cron');
const fetch = require('node-fetch');
const _ = require("lodash");

const { discordToken, ncfaToken } = require('./config/secrets.json');
const { channelId, cronJb, defaultMap, defaultTimeLimit, prefix } = require('./config/const.json');
const gameModes = require('./maps/mapList.json');

const client = new Discord.Client();

let map = defaultMap;
let timeLimit = defaultTimeLimit;

const job = new cron.CronJob(cronJb, () => {
    createGame(map, timeLimit);
});

const changeDailyParams = (newMap, newTime) => {
    map = newMap;
    timeLimit = newTime;
}

const createGame = (map, timeLimit) => {
    client.login(discordToken).then(async () => {
        try {
            const gameMode = findGameMode(map);

            const body = {
                "map": gameMode.id,
                "timeLimit": parseInt(timeLimit)
            };

            const { token } = await fetch('https://www.geoguessr.com/api/v3/challenges', {
                method: 'post',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': '_ncfa=' + ncfaToken
                }
            }).then(res => res.json());

            const geoChannel = client.channels.cache.get(channelId);
            const link = "https://www.geoguessr.com/challenge/" + token;
            geoChannel.send(gameMode.name + " " + (body.timeLimit > 60 ? Math.floor(body.timeLimit/60)+ "min " : "") + (body.timeLimit%60 !== 0 ? body.timeLimit%60 + "sec" : ""));
            geoChannel.send(link);
        } catch (e) {
            console.log('Error : ' + e);
        }
    });
}

const findGameMode = (command) => {
    return _.filter(gameModes, {"command": command})[0];
}

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'play') {
        switch (args.length) {
            case 2:
                createGame(args[0], args[1]);
                break;
            default:
                break;
        }
    }
    else if (command === 'settings' && args.length === 2) {
        changeDailyParams(args[0], args[1]);
    }
});

client.login(discordToken);

job.start();

