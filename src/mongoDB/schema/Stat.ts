import mongoose from "mongoose";
const Schema = mongoose.Schema;
const statSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    data: {
        type: Number,
        required: true
    }
});

export = mongoose.model("Stat", statSchema);