import mongoose from "mongoose";
const Schema = mongoose.Schema;
const worldSchema = new Schema({
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
    players: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "User"
        }
    ],
    areas: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "Area"
        }
    ],
    npcs: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "Character"
        }
    ],
    pcs: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "Character"
        }
    ]
});

export = mongoose.model("World", worldSchema);