import { Types } from "mongoose";

export interface IArea {
    name: {
        type: string,
        owner: Types.ObjectId,
        
        description?: string,
        areas?: Types.ObjectId[],
        npcs?: Types.ObjectId[],
    }
}