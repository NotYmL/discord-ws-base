const sleep = (milliseconds) => {return new Promise(resolve => setTimeout(resolve, milliseconds))};
const fetch = require('node-fetch');
const WebSocket = require('ws');

let token = "xxx.xxx.xxx";   // Dicord BOT token from https://discord.dev/
let intents = "32767"; // https://discord-intents-calculator.vercel.app/ and https://discord.com/developers/docs/topics/gateway#gateway-intents

function recursion()
{
    let socket = new WebSocket("wss://gateway.discord.gg/?encoding=json&v=9");
    socket.onready = function(event){
        console.log("WS Ready!")
    }

    socket.onclose = async function(event){
        console.log("Recursion!")
        recursion()
    }
    
    socket.onmessage = async function(event) { //https://discord.com/developers/docs/topics/gateway#commands-and-events-gateway-events
        let ctx = JSON.parse(event.data);

        if(ctx?.d?.heartbeat_interval!==undefined){
            var interval = JSON.parse(event.data)['d']['heartbeat_interval'];
            hb(socket, interval);
            socket.send(JSON.stringify({
                "op": 2, "d": { 
                "intents": intents,
                "token": token,
                "properties":{
                    "os":"Linux",
                    "browser":"Firefox",
                    "device":"",
                },
                "compress":false,
                }
            }));
        };

        switch (ctx["t"]) {
            case "READY":
                READY_Event(ctx);
                break;
            case "CHANNEL_CREATE":
                CHANNEL_CREATE_Event(ctx);
                break;
            case "CHANNEL_DELETE":
                CHANNEL_DELETE_Event(ctx);
                break;
            case "MESSAGE_CREATE":
                MESSAGE_CREATE_Event(ctx);
                break;
            case "MESSAGE_UPDATE":
                MESSAGE_UPDATE_Event(ctx) 
                break;
            case "MESSAGE_DELETE":
                MESSAGE_DELETE_Event(ctx) 
                break;
            case "MESSAGE_REACTION_ADD":
                REACTION_ADD_Event(ctx)
                break;
            case "MESSAGE_REACTION_REMOVE":
                REACTION_REMOVE_Event(ctx) 
                break;
            default:
                All_other_events(ctx)
        }

    }
}

recursion()

async function hb(socket, interval){ // https://discord.com/developers/docs/topics/voice-connections#heartbeating
    while(true){
        let hbpayload={
            'op': 1,
            'd': 'null'
        };
        socket.send(JSON.stringify(hbpayload));
        await sleep(interval);
    };
};

async function READY_Event (ctx) { };
async function CHANNEL_CREATE_Event (ctx) { };
async function CHANNEL_DELETE_Event (ctx) { };
async function MESSAGE_UPDATE_Event (ctx) { };
async function MESSAGE_CREATE_Event (ctx) { };
async function MESSAGE_DELETE_Event (ctx) { };
async function REACTION_ADD_Event (ctx) { };
async function REACTION_REMOVE_Event (ctx) { };
async function All_other_events (ctx) { };


async function sendMsg (channel_id, text) {     // https://discord.com/developers/docs/resources/channel#create-message
    let res = await fetch("https://discord.com/api/v9/channels/" + channel_id + "/messages", {
        "headers": {
            "authorization": token,
            "content-type": "application/json",
        },
        "body": JSON.stringify({ "content": text }),
        "method": "POST",
    });
    
    return await res.text()
}
