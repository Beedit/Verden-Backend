// Imports
import mongoose from "mongoose";
import { IUser } from "../interfaces/IUser";
const Schema = mongoose.Schema;

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    apiKey: {
        type: String,
        unique: true
    }
});

export = mongoose.model<IUser>("User", userSchema);