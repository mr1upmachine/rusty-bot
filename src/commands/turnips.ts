import axios from 'axios';
import { Client, Message } from 'discord.js';


let firebaseUrl = "https://us-central1-turniprofit-864ba.cloudfunctions.net";

exports.help = {
    description: 'Register yourself with the turnip bot!\n Then use me to set the current price of your turnips!',
    name: 'Turnip Price Tool',
    usage: '!turnips [price (int)] \n !turnips register',
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
    };

    const userId = msg.author!.id;
    const username = msg.author!.username;
    let command = args[0];
    console.log("In Command with arg: " + command)

    if (command.toLowerCase() === 'register') {
        const register = await postRegister(userId, username);
    } else if (/^\d+$/.test(command)) {
        // command is num, cast to int
        currentprice(parseInt(command), userId);
    } else {
        msg.channel.send("Invalid command, either register or send the current turnip price");
    }
};

function postRegister(userId: String, username: String): Promise<string> {
    const data = { "userId": userId, "username": username };
    return axios
        .post(`${firebaseUrl}/register`, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(res => {
            console.log(res);
            return "Response Recieved";
        });
};

function currentprice(price: number, userId: String) {
    return
};