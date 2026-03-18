import mongoose from "mongoose";
const Schema = mongoose.Schema;
const areaSchema = new Schema({
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