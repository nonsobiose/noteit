const express = require('express');
const app = express();
const port = process.env.PORT;
var hbs = require('express-handlebars');

app.set('view engine', 'hbs')
app.get('/redirect', (req, res) => {
    res.render('./redirect');
});
app.get('/startnote', (req, res) => res.send('This starts a note session'));
app.get('/endnote', (req, res) => res.send('This ends a note session'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
