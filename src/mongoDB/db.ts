// Imports requirements
import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose, { Types } from "mongoose";
import User from "./schema/User";
import World from "./schema/World";
import { StatusEnum } from "../enums/statusEnum";
import { IUser } from "./interfaces/IUser";
import { IWorld } from "./interfaces/IWorld";
import { IArea } from "./interfaces/IArea";

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


const generateAPIKey = () : string => {
    return crypto.randomUUID().replace(/-/g, "");
};

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

const authenticate = async (username: string, password: string) => {
    try {
        const user = await User.findOne({ username }).exec();

        if (user) {
            return await bcrypt.compare(password, user.password);
        }
    } catch {
        return false;
    }
    return false;
};

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

const getUserFromApiKey = async (key: string): Promise<[status: StatusEnum, user?: IUser | undefined]> => {
    try {
        const user = await User.findOne({ apiKey: key }).exec() as IUser;
        return [StatusEnum.SUCCESS, user];
    } catch {
        return [StatusEnum.ERROR];
    }
};

const createWorld = async (apiKey: string, world: IWorld): Promise<[status: StatusEnum, worldId?: Types.ObjectId | undefined]> => {
    const [ response, user ] = await getUserFromApiKey(apiKey);
    if (response == StatusEnum.SUCCESS && user?._id) {
        try {
            const newWorld = await World.create({
                name: world.name,
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
            if (w != null && w.owner._id.equals(user?._id)) {
                const returnWorld = {
                    name: w.name,
                    _id: w._id,

                    description: w.description,
                    players: w.players,
                    npcs: w.npcs,
                    pcs: w.pcs,
                } as IWorld;
                return [StatusEnum.SUCCESS, returnWorld];
            }
        } catch {
            return [StatusEnum.ERROR];
        }
    }

    return [StatusEnum.UNAUTHORISED];
};

// const createArea = async (apiKey: string, id: string, worldId: string, area: IArea): Promise<[status: StatusEnum, areaId?: Types.ObjectId | undefined]> => {
//     const [ response, user ] = await getUserFromApiKey(apiKey);
//     if (response == StatusEnum.SUCCESS) {
//         try {
//             const [response, world] = await getWorld(apiKey, worldId);
//             if (response == StatusEnum.SUCCESS) {
//                 world.
//             }
//         } catch {
//             return [StatusEnum.ERROR];
//         }
//     }

//     return [StatusEnum.UNAUTHORISED];

// };

// Exports the functions provided by this file
export = { connectDB, createUser, getApiKey, createWorld, getWorld, createArea };