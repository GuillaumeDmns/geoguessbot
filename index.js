const Discord = require('discord.js');
const { token } = require('./config/secrets.json');
const { channelId } = require('./config/const.json');

const client = new Discord.Client();

client.once('ready', () => {
    client.on('message', message => {
        if (message.content === '!ping') {
            // send back "Pong." to the channel the message was sent in
            message.channel.send('Pong.');
        }
    });

});

client.login(token).then(() => {
    const geoChannel = client.channels.cache.get(channelId);
    geoChannel.send("oui");

});
