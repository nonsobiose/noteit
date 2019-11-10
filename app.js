const express = require('express');
const app = express();
const path = require("path");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const port = process.env.PORT;
const moment = require('moment');
const fs = require('fs');
require('dotenv').config();

app.set('view engine', "hbs");
app.set('views', path.join(__dirname, "views"));
app.use(bodyParser());

const timeLogger = {};
let accessToken = '';

app.get('/oauth', (req, res) => {
    res.render('add_to_slack');
});

app.get('/redirect', async (req, res) => {
    const response = await fetch( `https://slack.com/api/oauth.access?client_id=${process.env.CLIENTID}&client_secret=${process.env.CLIENTSECRET}&code=${req.query.code}`);
    const responseJson = await response.json();
    accessToken = responseJson.access_token;
    res.send("You are ready to start taking note!")
});

app.post('/startnote', (req,res) => {
    console.log(req.body.team_id);
    console.log(req.body.team_domain);
    let timestamp = new Date(Date.now());

    const successMessage = {
        response_type: 'in_channel',
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Note started at *" + moment(timestamp).format('MMMM Do YYYY, h:mm:ss a') + ".*"
                }
            }
        ]
    };
    const failureMessage = {
        response_type: 'in_channel',
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Note already started!*"
                }
            }
        ]
    };


    if(timeLogger[req.body.team_id]){
        res.status(200).json(failureMessage);
    }else{
        timeLogger[req.body.team_id] = timestamp;
        res.status(200).json(successMessage);
    }
});

app.post('/endnote', async (req,res) => {
    const successMessage = {
        response_type: 'in_channel',
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Note Ended*"
                }
            }
        ]
    };
    const failureMessage = {
        response_type: 'in_channel',
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*No note is being taken*"
                }
            }
        ]
    };

    if(timeLogger[req.body.team_id]){
        const response = await fetch(`https://slack.com/api/conversations.history?token=${accessToken}&channel=${req.body.channel_id}`);
        const jsonResponse = await response.json();
        const messages = jsonResponse.messages;
        console.log(messages.length + "");
        const recentMessages = messages.filter(message => parseInt(message.ts) > timeLogger[req.body.team_id].getTime());
        console.log(timeLogger[req.body.team_id]);
        console.log("Time loger" + message.ts);
        console.log(recentMessages.length + "");
        const strippedMessages = recentMessages.map(recentMessage => recentMessage.text);
        console.log(strippedMessages.length + "");
        strippedMessages.forEach(m => {
           console.log(m);
        });
        delete timeLogger[req.body.team_id];
        res.status(200).json(successMessage);
    }else{
        res.status(200).json(failureMessage);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
