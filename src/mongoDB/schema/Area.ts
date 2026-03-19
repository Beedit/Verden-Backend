import mongoose from "mongoose";
import { IArea } from "../interfaces/IArea";
const Schema = mongoose.Schema;

const areaSchema = new Schema<IArea>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    dmOnlyNotes: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
        required: true
    },
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
    rootArea: {
        type: mongoose.Schema.Types.ObjectId, ref: "Area"
    },
    world: {
        type: mongoose.Schema.Types.ObjectId, ref: "World",
        required: true
    }
});

export = mongoose.model("Area", areaSchema);