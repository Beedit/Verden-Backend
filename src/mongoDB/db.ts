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

const createUser = async (username: string, password: string): Promise<[ status: status, key?:string ]> => {
    const dupeName = await User.findOne({
        username
    }).exec();

    if (dupeName) {
        return [status.DUPLICATE];
    }

    try {
        const hash: string = await bcrypt.hash(password, 12);
        const key: string = generateAPIKey();
        await User.create({
            username,
            password: hash,
            apiKey: key
        });

        return [ status.SUCCESS, key ];
    } catch {
        return [ status.ERROR ];
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
    return false;
};

const getApiKey = async (username: string, password: string): Promise<[status: status, apiKey?: string | undefined]> => {
    const auth = await authenticate(username, password);
    if (auth == true) {
        const user = await User.findOne({ username }).exec();

        if (user) {
            return [status.SUCCESS, user.apiKey];
        }
    }
    return [status.UNAUTHORISED];
};

const getUserFromApiKey = async (key: string): Promise<[status: status, user?: IUser | undefined]> => {
    try {
        const user = await User.findOne({ apiKey: key }).exec() as IUser;
        return [status.SUCCESS, user];
    } catch {
        return [status.ERROR];
    }
};

// Exports the functions provided by this file
export = { connectDB, createUser, getApiKey, getUserFromApiKey };