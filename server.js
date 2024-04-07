const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config()

mongoose.connect(process.env.DATABASE)
.then(() => console.log("Connected to database"))
.catch(err => console.log(err));
const app = express();

app.use(express.json());
app.use(morgan('dev'));


// models
const Api_key = require('./models/api_key');
// middleware
const {checkApiKey} = require('./middleware');
app.get('/', checkApiKey, async (req, res) => {
    const key = await Api_key.findOne({ value: req.headers['x-api-key'] });
    const message = `Valid API Key: ${key.value} \n Requests per month: ${key.requests_per_month} 
    Usage per month: ${key.usuage_per_month} \n Last reset date: ${key.last_reset_date} \n Expiration date: ${key && key.expiration_date}`;
    res.send(message);
});

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

// Schedule a task to run every hour
cron.schedule('0 * * * *', async () => {
    try{
        const currentDate = new Date();
        await Api_key.deleteMany({
            expiration_date: { $lt: currentDate }
        });
        const allApiKeys = await Api_key.find({ usuage_per_month: { $gt: 0 } });
        allApiKeys.forEach(async (apiKey) => {
            const lastReset = apiKey.last_reset_date || apiKey.createdAt;
            const nextReset = new Date(lastReset);
            nextReset.setMonth(lastReset.getMonth() + 1);
            if (currentDate >= nextReset) {
                apiKey.usuage_per_month = 0;
                apiKey.last_reset_date = currentDate; // Update lastReset to current time
                await apiKey.save();
                console.log(apiKey.value +' has been reset');
            }
        });
    }catch(err){
        console.log(err);
    }
});


app.listen(3000, () => {
    console.log("server is running on port 3000");
});