// Imports requirements
import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "./schema/User";
import { status } from "../enums/status";

// Handles connections to the database. Uses a variable from dotenv to provide the URL
const connectDB = async (uri: string) => {
    try {
        return await mongoose.connect(uri), {
            useUnifiedTopology: true,
            useNewUrlParser: true
        };
    } catch (err) {
        console.error(err);
    }
}; 


const generateAPIKey = () : string => {
    return crypto.randomBytes(50).toString("base64").slice(0,-4);
};

const createUser = async (username: string, password: string, callback: (response: status) => void) => {
    const dupeName = await User.findOne({
        username: username
    }).exec();

    if (dupeName) {
        return callback( status.DUPLICATE );
    }

    try {
        const hash: string = await bcrypt.hash(password, 12);
        await User.create({
            username,
            password: hash,
            apiKey: generateAPIKey()
        });

        return callback( status.SUCCESS );
    } catch {
        return callback( status.ERROR );
    }
};


// Exports the functions provided by this file
export = { connectDB, createUser };