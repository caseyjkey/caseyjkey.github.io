const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 8081;

const apiKey = process.env.YELP;

app.get('/autocomplete', (req, res) => {
    const { text } = req.query;
    console.log(text);
    const config = {
        method: 'get',
        url: `https://api.yelp.com/v3/autocomplete?text=${text}`,
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };

    axios(config)
        .then(function (response) {
            // res.send(JSON.stringify(response.data, null, 2));
            // res.send(term)
            console.log(response.data)
            return JSON.stringify(response.data, null, 2)
        }) 
        .then(function (jsonResponse) {
            res.send(jsonResponse)
        }) 
        .catch(function (error) {
            console.log(error);
        });
});
app.listen(port, () => console.log(`Hello from ${port}`));