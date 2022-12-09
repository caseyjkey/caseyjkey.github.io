const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
const port = process.env.PORT || 8081;

const apiKey = process.env.YELP;

app.get('/search', (req, res) => {
    console.log('serc', req.query);
    const params = req.query;
    const queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
    let config = {
        method: 'get',
        url: `https://api.yelp.com/v3/businesses/search?${queryString}`,
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };

    axios(config)
        .then(function (response) {
            return JSON.stringify(response.data, null, 2);
        }) 
        .then(function (jsonResponse) {
            res.status(200).send(jsonResponse);
        }) 
        .catch(function (error) {
            res.status(500).send({ error: error });
            console.log(error);
        });
})

app.get('/details', (req, res) => {
    console.log('det', req.query);
    const { id } = req.query;
    let config = {
        method: 'get',
        url: `https://api.yelp.com/v3/businesses/${id}`,
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };

    axios(config)
        .then(function (response) {
            return JSON.stringify(response.data, null, 2);
        }) 
        .then(function (jsonResponse) {
            res.status(200).send(jsonResponse);
        }) 
        .catch(function (error) {
            res.status(500).send({ error: error });
            console.log(error);
        });
})

app.get('/autocomplete', (req, res) => {
    const { term } = req.query;
    console.log('auto', term);
    let config = {
        method: 'get',
        url: `https://api.yelp.com/v3/autocomplete?text=${term}`,
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };

    axios(config)
        .then(function (response) {
            return JSON.stringify(response.data, null, 2);
        }) 
        .then(function (jsonResponse) {
            res.status(200).send(jsonResponse);
        }) 
        .catch(function (error) {
            res.status(500).send({ error: error });
            console.log(error);
        });
});

app.get('/reviews', (req, res) => {
    console.log('rev', req.query)
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
            res.status(200).send(jsonResponse);
        }) 
        .catch(function (error) {
            res.status(500).send({ error: error });
            console.log(id, error);
        });
});

app.listen(port, () => console.log(`Hello from ${port}`));