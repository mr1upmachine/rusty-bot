import axios from 'axios';
import { Client, Message } from 'discord.js';

let firebaseFuncUrl = "https://us-central1-turniprofit-864ba.cloudfunctions.net";
let firebaseDbUrl = "https://turniprofit-864ba.firebaseio.com/"

exports.help = {
    description: 'Register yourself with the turnip bot!\n Then use me to set the current price of your turnips!',
    name: 'Turnip Price Tool',
    usage: 'turnips register \n!turnips [price (int)]',
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
        msg.channel.send(register)
    } else if (/^\d+$/.test(command) && args.length === 1) {
        // command is num, cast to int
        //console.log(validateRegisteredUser(userId))
        if (await validateRegisteredUser(userId)) {
            console.log("validated user, submitting price")
            const priceRes = await currentprice(parseInt(command), userId);
            msg.channel.send(priceRes)
        } else {
            msg.channel.send(`Please register with the bot before submitting a price!\nUse \`!turnips register\``)
        }
    } else {
        msg.channel.send("Invalid command, either register or send the current turnip price");
    }
};

function validateRegisteredUser(userId: string): Promise<boolean> {
    // check user against submitted users in db
    const res = axios.get(`${firebaseDbUrl}/users.json`)
        .then(response => {
            console.log(response.data)
            if (response.data === null) {
                console.log("null data")
                return false;
            }
            if (userId in response.data) {
                console.log("returning true")
                return true;
            }
            return false;
        });
    return res;
}

async function postRegister(userId: String, username: String): Promise<string> {
    const data = { "userId": userId, "name": username };
    const res = await axios
        .post(`${firebaseFuncUrl}/register`, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
    //console.log(res);
    return res.data;
};

async function currentprice(price: number, userId: String): Promise<string> {
    // current price will check if the price is valid
    let today = new Date();
    let time = new Date(today.getTime());
    let mornOrEve;
    let date;
    if (time.getHours() < 12) {
        mornOrEve = "morning";
    } else {
        mornOrEve = "evening";
    }

    date = `${time.getFullYear()}-${time.getMonth()}-${time.getDay()}`;
    console.log(date + " " + mornOrEve);

    const data = { "price": price, "userId": userId, "day": date, "mornOrEve": mornOrEve };
    const res = await axios
        .post(`${firebaseFuncUrl}/setCurrentPrice`, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
    return res.data;
};