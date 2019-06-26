import { Client, Message } from 'discord.js';
// import { MersenneTwister } from "mersenne-twister";

exports.run = (client: Client, msg: Message, args: string[]) => {
    // size generates a random number for each user and then prints their
    // size to the messages
    const MersenneTwister = require('mersenne-twister');
    const user = msg.author.username;
    // test(msg);

    const userId = msg.author.id;
    // hash the user id
    const hash = hashCode(userId);
    const generator = new MersenneTwister(hash);
    let size = 0;

    const modifier = determineSize(hash);
    msg.channel.send('Your dong is: ' + modifier);

    if (modifier === 'magnum') {
        size = ((generator.random() * 5) + 6);
    } else if (modifier === 'normal') {
        size = ((generator.random() * 3) + 4);
    } else if (modifier === 'micro') {
        size = ((generator.random() * 3));
    }

    const message = 'You have a peepee size of: ' + size + ' inches';
    let donger = '8';
    for (let i = 0; i < Math.round(size); i++) {
        donger += '=';
    }
    donger += 'D';
    msg.channel.send(message);
    msg.channel.send('This is your dong: ' + donger);
};

function test(msg: Message) {
    const MersenneTwister = require('mersenne-twister');
    const sizeTrack: { [mod: string]: number } = {};
    sizeTrack['micro'] = 0;
    sizeTrack['magnum'] = 0;
    sizeTrack['normal'] = 0;
    for (let i = 0; i < 20; i++) {
        const rand = Math.random();
        const hash = hashCode(rand.toString());
        const modifier = determineSize(hash);
        sizeTrack[modifier] += 1;
    }
    for (const key in sizeTrack) {
        msg.channel.send(key + ' : ' + sizeTrack[key]);
    }
}

function determineSize(hash: number) {
    const modulo = hash % 10;
    if (modulo === 0) {
        // mini dong
        return 'micro';
    } else if (modulo > 8) {
        // magnum dong
        return 'magnum';
    } else {
        // normal dong
        return 'normal';
    }
}

function normalDistroGen(min: number, max: number, skew: number, hash: number) {
    const MersenneTwister = require('mersenne-twister');
    const generator = new MersenneTwister(hash);
    let u = 0;
    let v = 0;
    while (u === 0) { u = generator.random(); } // Converting [0,1) to (0,1)
    while (v === 0) { v = generator.random(); }
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) { num = normalDistroGen(min, max, skew, hash); } // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

function hashCode(x: string) {
    let hash = 0, i, chr;
    if (x.length === 0) { return hash; }
    for (i = 0; i < x.length; i++) {
        chr = x.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
