import axios from 'axios';
import { Client, Message } from 'discord.js';
import { config } from 'dotenv';

config();
if (!process.env.TURNIPROFITDB) {
  throw new Error('TURNIPROFITDB must be provided');
}
if (!process.env.TURNIPROFITURL) {
  throw new Error('TURNIPROFITURL must be provided');
}

let firebaseFuncUrl = process.env.TURNIPROFITURL;
let firebaseDbUrl = process.env.TURNIPROFITDB;

exports.help = {
  description: 'Register yourself with the turnip bot!\n Then use me to set the current price of your turnips!',
  name: 'Turnip Price Tool',
  usage: 'turnips register \n!turnips [price (int)]'
};

exports.run = async (client: Client, msg: Message, args: string[]) => {
  // turnips will register users or take in the current price of their turnips if they
  // are already registered

  // @param args
  //      register - submits the users name and id to the firebase DB
  //      currentprice - submits the users current price to the DB

  if (args === undefined || args.length === 0) {
    const desc = module.exports.help.description;
    const name = module.exports.help.name;
    const usage = module.exports.help.usage;
    msg.channel.send(`Name: ${name}\nDescription: ${desc}\nUsage: ${usage}`);
    return;
  }

  const userId = msg.author!.id;
  const username = msg.author!.username;
  let command = args[0];

  if (command.toLowerCase() === 'register') {
    const register = await postRegister(userId, username);
    msg.channel.send(register);
  } else if (/^\d+$/.test(command) && args.length === 1) {
    // command is num, cast to int
    //console.log(validateRegisteredUser(userId))
    const commandInt = parseInt(command);
    if (commandInt < 0 || commandInt > 900) {
      msg.channel.send('YOU TRYNA BREAK MY BOT? Number out of range, try again');
      return;
    }

    if (await validateRegisteredUser(userId)) {
      const priceRes = await currentprice(parseInt(command), userId);
      msg.channel.send(priceRes);
    } else {
      msg.channel.send(`Please register with the bot before submitting a price!\nUse \`!turnips register\``);
    }
  } else {
    msg.channel.send('Invalid command, either register or send the current turnip price');
  }
};

async function validateRegisteredUser(userId: string): Promise<boolean> {
  // check user against submitted users in db
  const res = await axios.get(`${firebaseDbUrl}/users.json`);
  if (res.data === null) {
    return false;
  }
  if (userId in res.data) {
    return true;
  }
  return false;
}

async function postRegister(userId: String, username: String): Promise<string> {
  const data = { userId: userId, name: username };
  const res = await axios.post(`${firebaseFuncUrl}/register`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  //console.log(res);
  return res.data;
}

async function currentprice(price: number, userId: String): Promise<string> {
  // current price will check if the price is valid
  let today = new Date();
  let time = new Date(today.getTime());
  let mornOrEve;
  let date;
  if (time.getHours() < 12) {
    mornOrEve = 'morning';
  } else {
    mornOrEve = 'evening';
  }

  date = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;

  const data = { price: price, userId: userId, day: date, mornOrEve: mornOrEve };
  const res = await axios.post(`${firebaseFuncUrl}/setCurrentPrice`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.data;
}
