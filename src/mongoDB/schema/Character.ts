import mongoose from "mongoose";
const Schema = mongoose.Schema;

const characterSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
        required: true
    },
    stats: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "Stat"
        }
    ]
});

export = mongoose.model("Character", characterSchema);