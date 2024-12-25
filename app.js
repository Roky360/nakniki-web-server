import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import {env} from "custom-env";

env(process.env.NODE_ENV, "./config");

// connect to mongodb
mongoose.connect(process.env.CONNECTION_STRING, {
    useUnifiedTopology: true,
});

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

// set app endpoints
// app.use(...)

app.listen(process.env.PORT);
