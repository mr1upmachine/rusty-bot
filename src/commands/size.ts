import { Client, Message } from 'discord.js';
//import { MersenneTwister } from "mersenne-twister";

exports.run = (client: Client, msg: Message, args: string[]) => {
    // size generates a random number for each user and then prints their
    // size to the messages
    const MersenneTwister = require("mersenne-twister");
    const user = msg.author.username;
    //const userId = msg.author.id;
    const userId = "321561549813216231"
    // hash the user id
    const hash = hashCode(userId);

    let generator = new MersenneTwister(hash);

    //TODO: determine if user should get normal or magnum dong
    const size = ((generator.random() * 15) + 1);
    var message = "You have a peepee size of: " + size + " inches";
    var donger = "8"
    for(let i = 0; i < Math.round(size); i++) {
        donger += "=";
    }
    donger += "D";
    msg.channel.send(message);
    msg.channel.send("This is your dong: " + donger);
};

function hashCode(x: String) {
    var hash = 0, i, chr;
    if (x.length === 0) return hash;
    for (i = 0; i < x.length; i++) {
        chr = x.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}