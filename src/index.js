const express = require('express');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const fetch = require('node-fetch');
const cache = require('js-cache');

const app = express();
const port = process.env.PORT || 4041;

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.get('/', async function (req, res) {

    let fromCurrency = req.query.fromCurrency;
    let amount = req.query.amount;
    let toCurrency = req.query.toCurrency;

    var valueUSD = 0;
    var valueLKR = 0;

    // Check whether the CACHE exist - IF == YES
    if (typeof cache.get('testCurrency') == undefined) {

        //get LKR and USD currency values from stored CACHE
        var valueUSD = data.USD;
        var valueLKR = data.LKR;

        //Equation to convert the fromCurrency -> toCurrency - API gives us the EUR conversion
        var totalAmount = (amount / valueLKR) * valueUSD;

        //Return the JSON
        return res.json({
            "amount": totalAmount,
            "currency": toCurrency
        });

    } else { //- IF == NO

        //get USD Currency Value
        await fetch('http://data.fixer.io/api/latest?access_key=2e70aaac34352ee4b4d69286fb7064c0&symbols=' + toCurrency)
            .then(response => response.json())
            .then(async data => {
                valueUSD = data.rates.USD;
                console.log(data);
            })

        //get LKR Currency Value
        await fetch('http://data.fixer.io/api/latest?access_key=2e70aaac34352ee4b4d69286fb7064c0&symbols=' + fromCurrency)
            .then(response => response.json())
            .then(async data => {
                valueLKR = data.rates.LKR;
                console.log(data);
            })

        //Creates a JSON with USD and LKR values
        data = {
            "USD": valueUSD,
            "LKR": valueLKR
        };

        //Caching above JSON for 24hrs(TTL = 86400000sec)
        await cache.set('testCurrency', data, 86400000); //86400000

        //Equation to convert the fromCurrency -> toCurrency - API gives us the EUR conversion
        var totalAmount = (amount / valueLKR) * valueUSD;

        //Return the JSON
        return res.json({
            "amount": totalAmount,
            "currency": toCurrency
        });
    }

});

app.listen(port, () => {
    console.log(`Server is runnuing on port: ${port}`);
});