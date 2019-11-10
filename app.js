const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const path = require("path");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

app.set('view engine', "hbs");
app.set('views', path.join(__dirname, "views"));
app.use(bodyParser());

storedtimes = {};

app.get('/oauth', (req, res) => {
    res.render('add_to_slack');
});

app.get('/redirect', async (req, res) => {
    const response = await fetch( `https://slack.com/api/oauth.access?client_id=${process.env.CLIENTID}&client_secret=${process.env.CLIENTSECRET}&code=${req.query.code}`);
    const responseJson = await response.json();
    console.log(responseJson);
    res.send("You have been successful" + responseJson)
});

app.post('/startnote', (req,res) => {
    console.log('hey')
    console.log(req.body.team_id);
    console.log(req.body.team_domain);
    currtime = new Date(Date.now());

    const successmessage = {
        response_type: 'in_channel',
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Your lecture has been recorded at time *" + currtime.toLocaleDateString() + ".*"
                }
            }
        ]
    };
    const failuremessage = {
        response_type: 'in_channel',
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*You are already recording a lecture!*"
                }
            }
        ]
    };


    if(storedtimes[req.body.team_id]){
        res.status(200).json(failuremessage);
    }else{
        storedtimes[req.body.team_id] = currtime;
        res.status(200).json(successmessage);
    }
});

app.post('/endnote', (req,res) => {
    const successmessage = {
        response_type: 'in_channel',
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Lecture successfully stopped*"
                }
            }
        ]
    };
    const failuremessage = {
        response_type: 'in_channel',
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*No Lecture is being recorded!*"
                }
            }
        ]
    };

    if(storedtimes[req.body.team_id]){
        delete storedtimes[req.body.team_id];
        res.status(200).json(successmessage);
    }else{
        res.status(200).json(failuremessage);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
