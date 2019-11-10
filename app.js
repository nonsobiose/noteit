const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const path = require("path");
const fetch = require("node-fetch");

app.set('view engine', "hbs");
app.set('views', path.join(__dirname, "views"));

app.get('/oauth', (req, res) => {
    res.render('add_to_slack');
});

app.get('/add_to_slack', (req, res) => {
    res.render('download');
});

app.get('/redirect', async (req, res) => {
    const response = await fetch( `https://slack.com/api/oauth.access
    &code=${req.query.code}
    &client_id=${process.env.CLIENTID}
    &client_secret=${process.env.CLIENTSECRET}`);
    console.log(response)
});

app.get('/startnote', (req, res) => res.send('This starts a note session'));
app.get('/endnote', (req, res) => res.send('This ends a note session'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
