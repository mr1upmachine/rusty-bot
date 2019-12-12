import { Client, Message } from 'discord.js';
import MersenneTwister from 'mersenne-twister';
// import { MersenneTwister } from "mersenne-twister"; // unused import

// TODO: Evaluate the spread of the modifier generation
// TODO: Improve message formatting
// TODO: Implement dong leaderboard
// TODO: Allow people to regenerate their dong on occasion (need to redesign how hash works)
// TODO: Add gifs maybe?

exports.help = {
  description: 'Measure the size of your dong!',
  name: 'Dong Size',
  usage: 'dong',
};

exports.run = async (client: Client, msg: Message, args: string[]) => {
  // size generates a random number for each user and then prints their
  // size to the messages
  // @param args - NO OPTIONAL ARGS AVAILABLE

  // test(msg);
  const user = msg.author!.username;
  const userId = msg.author!.id;
  const hash = hashCode(userId);
  const generator = new MersenneTwister(hash);
  const modifier = determineSize(hash);
  let size = 0;
  let message = '';

  if (modifier === 'magnum') {
    size = generator.random() * 5 + 5;
    message += `Wow ${user} you got a *MAGNUM* dong!`;
  } else if (modifier === 'normal') {
    size = generator.random() * 3 + 3;
    message += `Hey ${user} it\'s not the size of the wave, it\'s the motion of the ocean.`;
  } else if (modifier === 'micro') {
    size = generator.random() * 3;
    message += `Uhh.. ${user}, where is it..?`;
  }
  message += '\nYour dong is ' + size.toFixed(2) + ' inches!';

  let donger = '8';
  for (let i = 0; i < Math.floor(size); i++) {
    donger += '=';
  }
  donger += 'D';
  msg.channel.send(message);
  msg.channel.send('Everyone look at ' + user + "'s dong: " + donger);
};

function hashCode(x: string) {
  let hash = 0;
  if (x.length === 0) {
    return hash;
  }

  for (let i = 0; i < x.length; i++) {
    const chr = x.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function determineSize(hash: number): 'micro' | 'magnum' | 'normal' {
  const modulo = Math.abs(hash) % 100;
  if (modulo < 10) {
    // micro dong
    return 'micro';
  } else if (modulo > 85) {
    // magnum dong
    return 'magnum';
  } else {
    // normal dong
    return 'normal';
  }
}

// Commenting test code for later use
// function test(msg: Message) {
//     // const MersenneTwister = require('mersenne-twister');
//     const sizeTrack: { [mod: string]: number } = {};
//     sizeTrack.micro = 0;
//     sizeTrack.magnum = 0;
//     sizeTrack.normal = 0;
//     for (let i = 0; i < 20; i++) {
//         const rand = Math.random();
//         const hash = hashCode(rand.toString());
//         const modifier = determineSize(hash);
//         sizeTrack[modifier] += 1;
//     }
//     for (const key in sizeTrack) {
//         msg.channel.send(key + ' : ' + sizeTrack[key]);
//     }
// }

// Commenting test code for later use
// function normalDistroGen(min: number, max: number, skew: number, hash: number) {
//     // const MersenneTwister = require('mersenne-twister');
//     const generator = new MersenneTwister(hash);
//     let u = 0;
//     let v = 0;
//     while (u === 0) { u = generator.random(); } // Converting [0,1) to (0,1)
//     while (v === 0) { v = generator.random(); }
//     let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

//     num = num / 10.0 + 0.5; // Translate to 0 -> 1
//     if (num > 1 || num < 0) { num = normalDistroGen(min, max, skew, hash); } // resample between 0 and 1 if out of range
//     num = Math.pow(num, skew); // Skew
//     num *= max - min; // Stretch to fill range
//     num += min; // offset to min
//     return num;
// }
