// Imports requirements
import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose, { Types } from "mongoose";
import User from "./schema/User";
import World from "./schema/World";
import { StatusEnum } from "../enums/statusEnum";
import { IUser } from "./interfaces/IUser";
import { IWorld } from "./interfaces/IWorld";
import Area from "./schema/Area";

// Handles connections to the database. Uses a variable from dotenv to provide the URL
const connectDB = async (uri: string) => {
    try {
        return await mongoose.connect(uri), {
            useUnifiedTopology: true,
            useNewUrlParser: true
        };
    } catch (err) {
        console.error(err);
    }
}; 

// Creates an API Key by making a random UUID and then removing the dashes.
const generateAPIKey = () : string => {
    return crypto.randomUUID().replace(/-/g, "");
};

// Create a user
const createUser = async (username: string, password: string): Promise<[ status: StatusEnum, key?:string ]> => {
    const dupeName = await User.findOne({
        username
    }).exec();

    if (dupeName) {
        return [StatusEnum.DUPLICATE];
    }

    try {
        const hash: string = await bcrypt.hash(password, 12);
        const key: string = generateAPIKey();
        await User.create({
            username,
            password: hash,
            apiKey: key
        });

        return [ StatusEnum.SUCCESS, key ];
    } catch {
        return [ StatusEnum.ERROR ];
    }
};

// Authenticates by finding the user by username and comparing their password. returns a Promise<boolean>
const authenticate = async (username: string, password: string): Promise<boolean> => {
    try {
        const user = await User.findOne({ username }).exec();

        if (user) {
            return await bcrypt.compare(password, user.password);
        } else {
            return false;
        }
    } catch {
        return false;
    }
};

// Gets a user's API Key from their username and password. 
const getApiKey = async (username: string, password: string): Promise<[status: StatusEnum, apiKey?: string | undefined]> => {
    const auth = await authenticate(username, password);
    if (auth == true) {
        const user = await User.findOne({ username }).exec();

        if (user) {
            return [StatusEnum.SUCCESS, user.apiKey];
        }
    }
    return [StatusEnum.UNAUTHORISED];
};

// Gets a user from their API Key.
const getUserFromApiKey = async (key: string): Promise<[status: StatusEnum, user?: IUser | undefined]> => {
    try {
        const user = await User.findOne({ apiKey: key }).exec() as IUser;
        return [StatusEnum.SUCCESS, user];
    } catch {
        return [StatusEnum.ERROR];
    }
};

// Creates a world in the database.
const createWorld = async (apiKey: string, name: string): Promise<[status: StatusEnum, worldId?: Types.ObjectId | undefined]> => {
    const [ response, user ] = await getUserFromApiKey(apiKey);
    if (response == StatusEnum.SUCCESS && user?._id) {
        try {
            const newWorld = await World.create({
                name: name,
                owner: user._id,
            });

            return [StatusEnum.SUCCESS, newWorld._id];
        } catch {
            return [StatusEnum.ERROR];
        }
    }

    return [StatusEnum.UNAUTHORISED];

};


const getWorld = async (apiKey: string, id: string): Promise<[status: StatusEnum, world?: IWorld]> => {
    const [ response, user ] = await getUserFromApiKey(apiKey);

    if (response == StatusEnum.SUCCESS) {
        try {
            const w = await World.findById(id);

            if (w && w.owner && w.players) {
                if (w.owner._id.equals(user?._id)){
                    const returnWorld = {
                        name: w.name,
                        _id: w._id,
                        owner: w.owner,

                        dmOnlyNotes: w.dmOnlyNotes,
                        description: w.description,
                        players: w.players,
                        npcs: w.npcs,
                        pcs: w.pcs,
                    } as IWorld;
                    return [StatusEnum.SUCCESS, returnWorld];
                } else if (w.players.some((player) => { return player.equals(user?._id); })) {
                    const returnWorld = {
                        name: w.name,
                        _id: w._id,
                        owner: w.owner,

                        description: w.description,
                        players: w.players,
                        npcs: w.npcs,
                        pcs: w.pcs,
                    } as IWorld;
                    return [StatusEnum.SUCCESS, returnWorld];
                }
            }
        } catch {
            return [StatusEnum.ERROR];
        }
    }

    return [StatusEnum.UNAUTHORISED];
};


// Owner can add a player to a world with their Id.
const addPlayerToWorld = async (apiKey: string, worldId: string, playerId: string) => {
    const [ userResponse, user ] = await getUserFromApiKey(apiKey);

    if (userResponse == StatusEnum.SUCCESS) {
        const world = await World.findOne({_id: worldId}).exec();
        if (world?.owner?._id.equals(user?._id) && !world?.players?.some((x) => { return x.equals(playerId); })) {
            world.players?.push(new mongoose.Types.ObjectId(playerId));
            world.save();
            return StatusEnum.SUCCESS;
        }
    }
    return StatusEnum.UNAUTHORISED;
};

const createArea = async (apiKey: string, worldId: string, areaName: string): Promise<[status: StatusEnum, areaId?: Types.ObjectId | undefined]> => {
    const [ response, user ] = await getUserFromApiKey(apiKey);
    if (response == StatusEnum.SUCCESS && user) {
        try {
            const newArea = await Area.create({
                name: areaName,
                owner: user._id,
                world: worldId,
            });

            const world = await World.findById(worldId).exec();
            
            world?.areas?.push(newArea._id);
            world?.save();
            return [StatusEnum.SUCCESS];

        } catch {
            return [StatusEnum.ERROR];
        }
    }
    return [StatusEnum.UNAUTHORISED];
};

// Exports the functions provided by this file
export = { connectDB, createUser, getApiKey, createWorld, getWorld, addPlayerToWorld, createArea };