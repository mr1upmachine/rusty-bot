import { Client, Message } from 'discord.js';
import axios from 'axios';

class Users {
    to: string;
    from: string;
    constructor(to: string, from: string){
        this.to = to;
        this.from = from;
    }
}

class Variables {
    users: Users;
    constructor(users: Users){
        this.users = users;
    }
}

class GraphRequest {
    variables: Variables;
    operationName: string;
    query: string;
    constructor(variables: Variables, operationName: string,  query: string){
        this.variables = variables;
        this.operationName = operationName;
        this.query = query;
    }
}
   
exports.help = {
    description: 'Use this to insult people, call them names, and make them cry.',
    name: 'Insult',
    usage: 'insult'
};

exports.run = async(client: Client, msg: Message, args: string[]) => {
    // User to be insulted.
    const to = args[0];
    // UID of the author for the message.
    const from = `<@${msg.author!.id}>`;
    const users = new Users(to, from);
    
    //  Create a REST client and make a POST request to the endpoint.
    const insult = await getInsult(users);

    msg.channel.send(insult);
};
 
/**
 * getInsult forms a graphQL request using provided variables, and sends a POST to the insult service endpoint.
 * It then returns a Promise from this call that resolves to a string.
 * @param users 
 */
function getInsult(users: Users): Promise<string> {
    const variables = new Variables(users);
    const gqlRequest = new GraphRequest(variables, "getinsult", "query getinsult($users: Users!) { GetInsult(people: $users) { message }}");
    
    const message = axios.post(`https://insult.appspot.com/graphql`, gqlRequest)
        .then( res => {
            return  res.data.data.GetInsult.message;
        })
        .catch( error => {
            console.log(error);
            return `Honestly couldn't think of anything.  Sorry, check back later.`
        });

    return message;
}