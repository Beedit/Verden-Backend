// Imports requirements
import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "./schema/User";
import { status } from "../enums/status";
import { IUser } from "./interfaces/IUser";

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

const createUser = async (username: string, password: string, callback: (response: status, key?: string) => void) => {
    const dupeName = await User.findOne({
        username
    }).exec();

    if (dupeName) {
        return callback( status.DUPLICATE );
    }

    try {
        const hash: string = await bcrypt.hash(password, 12);
        const key: string = generateAPIKey();
        await User.create({
            username,
            password: hash,
            apiKey: key
        });

        return callback( status.SUCCESS, key );
    } catch {
        return callback( status.ERROR );
    }
};

const authenticate = async (username: string, password: string) => {
    try {
        const user = await User.findOne({ username }).exec();

        if (user) {
            return await bcrypt.compare(password, user.password);
        }
    } catch {
        return false;
    }
};

const getApiKey = async (username: string, password: string, callback: (response?: string) => void) => {
    const auth = await authenticate(username, password);
    if (auth == true) {
        const user = await User.findOne({ username }).exec();

        if (user) {
            callback(String(user.apiKey));
        }
    } else {
        callback();
    }
};

const getUserFromApiKey = async (key: string, callback: (status: status, user?: IUser) => void) => {
    try {
        const user = await User.findOne({ apiKey: key }).exec() as IUser;
        return callback(status.SUCCESS, user);
    } catch {
        return callback(status.ERROR);
    }
};


// Exports the functions provided by this file
export = { connectDB, createUser, getApiKey, getUserFromApiKey };