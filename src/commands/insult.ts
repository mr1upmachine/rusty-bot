import axios from 'axios';
import { Client, Message } from 'discord.js';
import GraphVariables from '../entities/graphVariables';
import Users from '../entities/Users';

class GraphRequest {
    constructor(public variables: GraphVariables, public operationName: string,  public query: string) {}
}

exports.help = {
    description: 'Use this to insult people, call them names, and make them cry.',
    name: 'Insult',
    usage: 'insult',
};

exports.run = async (client: Client, msg: Message, args: string[]) => {
    // User to be insulted.
    const to = args[0];
    // UID of the author for the message.
    const from = `<@${msg.author!.id}>`;
    //  Create a REST client and make a POST request to the endpoint.
    const insult = await getInsult(new Users(to, from));

    msg.channel.send(insult);
};
/**
 * getInsult forms a graphQL request using provided variables, and sends a POST to the insult service endpoint.
 * It then returns a Promise from this call that resolves to a string.
 * @param users
 */
function getInsult(users: Users): Promise<string> {
    const gqlRequest = new GraphRequest(new GraphVariables(users), 'getInsult', 'query getInsult($users: Users!) { GetInsult(people: $users) { message }}');
    return axios.post(`https://insult.appspot.com/graphql`, gqlRequest)
        .then( (res) => {
            return  res.data.data.GetInsult.message;
        })
        .catch( (error) => {
            console.log(error);
            return `Honestly couldn't think of anything.  Sorry, check back later.`;
        });
}
