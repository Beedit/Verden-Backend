import mongoose from "mongoose";
import { IWorld } from "../interfaces/IWorld";
const Schema = mongoose.Schema;

const worldSchema = new Schema<IWorld>({
    name: {
        type: String,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
        required: true
    },


    description: {
        type: String,
    },
    dmOnlyNotes: {
        type: String,
    },
    players: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "User",
            required: false
        }
    ],
    areas: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "Area",
            required: false
        }
    ],
    npcs: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "Character",
            required: false
        }
    ],
    pcs: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "Character",
            required: false
        }
    ]
});

export = mongoose.model<IWorld>("World", worldSchema);