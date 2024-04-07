const Api_key = require('./models/api_key');

module.exports.checkApiKey = async (req, res, next) => {
    try{
        const apiKeyValue = req.headers['x-api-key']; 
        if (!apiKeyValue) return res.status(401).send('API key is required');
        const apiKey = await Api_key.findOne({ value: apiKeyValue });
        if (!apiKey) return res.status(401).send('Invalid API key');
        if(apiKey.usuage_per_month >= apiKey.requests_per_month){
            return res.status(401).send("Your API key has exceeded its usage limit for this month. Please wait until the usage resets next month.");
        }
        apiKey.usuage_per_month += 1;
        await apiKey.save();
        next();
    }catch(err){
        res.status(500).send(err);
    }
}