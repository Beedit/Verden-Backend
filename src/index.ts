// Setup imports
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

import { Response, Request, NextFunction } from "express";
import { status } from "./enums/status";

import express from "express";
import databaseHelper from "./mongoDB/databaseHelper";
import mongoose from "mongoose";

// Start express app
const port = process.env.PORT;
const app = express();

// Connect to the mongodb database
databaseHelper.connectDB(String(process.env.MONGOURI));

// app stuff
app.use(express.json());


// Log the request, ip and time when a request is made
app.use(function(req: Request, res: Response, next: NextFunction){
    console.log(`Incomming ${req.method} request from ${req.ip} at ${Date.now()} on ${req.url}`);
    next();
});

app.post("createUser", (req: Request, res: Response) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ "Error": "Username and password required" });
    }

    databaseHelper.createUser(req.body.username, req.body.password, (result: status, apiKey?: string) => {
        if (result == status.SUCCESS) {
            return res.status(201).json({ "apiKey": apiKey});
        } else if (result == status.DUPLICATE) {
            return res.status(409).json({ "Error": "Username in use"});
        } else {
            return res.status(500).json({ "Error": "Unknown error" });
        }
    });
});


// Unused methods and bad requests.
app.all("/{*any}", function(req: Request, res: Response) { res.send(`${req.method} not supported\n`); });


// Runs the API once the connection to the database has been made
mongoose.connection.once("open", () => {
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
});