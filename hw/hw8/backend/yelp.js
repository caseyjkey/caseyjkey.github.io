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
    let config = {
        method: 'get',
        url: `https://api.yelp.com/v3/autocomplete?text=${text}`,
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };

    axios(config)
        .then(function (response) {
            return JSON.stringify(response.data, null, 2)
        }) 
        .then(function (jsonResponse) {
            res.send(jsonResponse)
        }) 
        .catch(function (error) {
            console.log(error);
        });
});

app.get('/reviews', (req, res) => {
    console.log(req.query)
    const { id } = req.query;
    console.log(id);
    let config = {
        method: 'get',
        url: `https://api.yelp.com/v3/businesses/${id}/reviews`,
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };

    axios(config)
        .then(function (response) {
            console.log(response.data)
            return JSON.stringify(response.data, null, 2)
        }) 
        .then(function (jsonResponse) {
            res.send(jsonResponse)
        }) 
        .catch(function (error) {
            console.log(id, error);
        });
});

app.listen(port, () => console.log(`Hello from ${port}`));