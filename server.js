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


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log("server is running on port 3000");
});