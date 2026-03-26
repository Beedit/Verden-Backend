import { Types } from "mongoose";

export interface IWorld {
    name: string,
    owner: Types.ObjectId,
    
    description?: string,
    dmOnlyNotes?: string,
    players?: Types.ObjectId[],
    areas?: Types.ObjectId[],
    npcs?: Types.ObjectId[],
    pcs?: Types.ObjectId[]
}