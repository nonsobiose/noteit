const express = require('express');
const app = express();
const path = require("path");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const port = process.env.PORT;
const moment = require('moment');
require('dotenv').config();

app.set('view engine', "hbs");
app.set('views', path.join(__dirname, "views"));
app.use(bodyParser());

const timeLogger = {};

app.get('/oauth', (req, res) => {
    res.render('add_to_slack');
});

app.get('/redirect', async (req, res) => {
    const response = await fetch( `https://slack.com/api/oauth.access?client_id=${process.env.CLIENTID}&client_secret=${process.env.CLIENTSECRET}&code=${req.query.code}`);
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
        delete timeLogger[req.body.team_id];
        const response = await fetch(`https://slack.com/api/conversations.history?token=${req.query.token}&channel=${req.query.channelId}`);
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        res.status(200).json(successMessage);
    }else{
        res.status(200).json(failureMessage);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
