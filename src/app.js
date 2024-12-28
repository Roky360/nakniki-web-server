const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const {env} = require("custom-env");

const appRouter = require('./routes/appRouter');

// check app variables
env(process.env.NODE_ENV, "./config");
if (process.env.MONGODB_URI === undefined) {
    console.error("MongoDB URI is missing");
    process.exit(1);
}
if (process.env.PORT === undefined) {
    console.error("App port is missing");
    process.exit(1);
}

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
});

// setup app
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

// set app endpoints
// app.use(...)
app.use('/api', appRouter);

console.log(`Running on http://localhost:${process.env.PORT}`);
app.listen(process.env.PORT);
