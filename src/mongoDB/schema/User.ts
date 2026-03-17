// Imports
import mongoose from "mongoose";
import { IUser } from "../interfaces/IUser";
const Schema = mongoose.Schema;


// Creates the schema with a structure suitable for the project
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

// Exports the schema with the name "User"
export = mongoose.model<IUser>("User", userSchema);