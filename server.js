const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.DATABASE)
.then(() => console.log("Connected to database"))
.catch(err => console.log(err));
const app = express();

app.use(express.json());
app.use(morgan('dev'));


// models
const Api_key = require('./models/api_key');

app.get('/api-keys', async (req, res) => {
    const apiKeys = await Api_key.find();
    res.json(apiKeys);
});
app.post('/generate-api-key', async (req, res) => {
    try{
        const { requests_per_month, number_of_months } = req.body;

        if(number_of_months < 1) throw new Error('Number of months must be greater than 0');
        if(requests_per_month < 1) throw new Error('Number of requests per month must be greater than 0');

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + number_of_months);

        const newApiKey = new Api_key({
            requests_per_month: requests_per_month,
            expiration_date: expirationDate
        });
        await newApiKey.save();
        res.json(newApiKey);
    }catch(err){
        res.status(500).send(err);
    }

});
app.listen(3000, () => {
    console.log("server is running on port 3000");
});