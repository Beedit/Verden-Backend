// Imports
import mongoose from "mongoose";
const Schema = mongoose.Schema;


// Creates the schema with a structure suitable for the project
const userSchema = new Schema({
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
export = mongoose.model("User", userSchema);