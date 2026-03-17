// Setup imports
// Dotenv works like this so im not gonna change it. ESLint can be quiet for one line im sure.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

import { Response, Request, NextFunction } from "express";
import { StatusEnum } from "./enums/statusEnum";

import express from "express";
import db from "./mongoDB/db";
import mongoose from "mongoose";
import { body, matchedData, validationResult } from "express-validator";
import { IWorld } from "./mongoDB/interfaces/IWorld";

// Start express app
const port = process.env.PORT;
const app = express();

// Connect to the mongodb database
db.connectDB(String(process.env.MONGOURI));

// Middleware

// Log the request, ip and time when a request is made
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Incomming ${req.method} request from ${req.ip} at ${Date.now()} on ${req.url}`);
    next();
});

// Validate JSON and throw error if invalid.
app.use(express.json({
    verify: (_req, res: Response, buf): void => {
        try {
            JSON.parse(String(buf));
        } catch {
            res.status(400).send({ "Error": "Invalid JSON"});
            throw Error("Invalid JSON");
        }
    }
}));



// Routes
app.post("/createUser",
    body("username").notEmpty().trim().escape().withMessage("Please provide a valid username"),
    body("password").notEmpty().escape().withMessage("Please provide a valid password"),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        const data = matchedData(req);

        if (result.isEmpty()) {
            const [result, key] = await db.createUser(data.username, data.password);
            if (result == StatusEnum.SUCCESS) {
                res.status(201).json({ "apiKey": key});
            } else if (result == StatusEnum.DUPLICATE) {
                res.status(409).json({ "Error": "Username in use"});
            } else {
                res.status(500).json({ "Error": "Unknown error" });
            }
        } else { 
            return res.status(400).json({ "Error": result.array() });
        }
    }
);

app.get("/getApiKey",
    body("username").notEmpty().trim().escape().withMessage("Please provide a valid username"),
    body("password").notEmpty().escape().withMessage("Please provide a valid password"),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        const data = matchedData(req);

        if (result.isEmpty()) {
            const [response, key] = await db.getApiKey(data.username, data.password);
            if (response == StatusEnum.SUCCESS) {
                res.json({"apiKey": key});
            } else {
                res.status(401).json({ "Error": "Invalid username or password"});
            }
            return;
        }

        res.status(400).json({ "Error": result.array() });
    }
);

app.post("/createWorld",
    body("apiKey").notEmpty().escape().withMessage("Please provide a valid API Key"),
    body("name").notEmpty().escape().withMessage("Please provide a valid name"),
    body("description").optional().escape(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        const data = matchedData(req);

        if (result.isEmpty()) {
            const newWorld: IWorld = {
                name: data.name,
                description: data.description
            };
            const [result, worldId] = await db.createWorld(data.apiKey, newWorld);
            if (result == StatusEnum.SUCCESS) {
                res.status(201).json({ "id": worldId});
            } else {
                res.status(500).json({ "Error": "Unknown error" });
            }
        } else { 
            return res.status(400).json({ "Error": result.array() });
        }
    }
);

app.get("/getWorld",
    body("apiKey").notEmpty().escape().withMessage("Please provide a valid API Key"),
    body("id").notEmpty().escape().withMessage("Please provide a valid world id"),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        const data = matchedData(req);

        if (result.isEmpty()) {
            const [response, world] = await db.getWorld(data.apiKey, data.id);
            if (response == StatusEnum.SUCCESS) {
                res.json({ world });
            } else {
                res.status(401).json({ "Error": "Invalid API Key or world id."});
            }
            return;
        }

        res.status(400).json({ "Error": result.array() });
    }
);

// Unused methods and bad requests.
app.all("/{*any}", (req: Request, res: Response) => {
    res.send(`${req.method} not supported\n`);
});


// Runs the API once the connection to the database has been made
mongoose.connection.once("open", () => {
    app.listen(port, async () => {
        console.log(`Listening on port ${port}`);
    });
});