import { ObjectId } from "mongodb";

export interface IUser {
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    admin: boolean;
    score: number;
    blamed: number;
    escaped: number;
}

export interface ISimpleUser {
    _id: ObjectId;
    name: string;
}

export interface ILoginRequest {
    email: string;
    password: string;
}

export interface IRegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface ISession {
    userId: ObjectId;
    token: string;
}