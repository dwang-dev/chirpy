import argon2 from "argon2"
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "./errors.js";
import { Request, Response } from "express"

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

const JWT_ISSUER = "chirpy";

export function hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
}

export function checkPasswordHash(hash: string, password: string) {
    return argon2.verify(hash, password);
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const iat = Math.floor(Date.now() / 1000);
    const payload: Payload = {
        iss: "chirpy",
        sub: userID,
        iat: iat,
        exp: iat + expiresIn,
    };
    return jwt.sign(payload, secret);
}


export function validateJWT(tokenString: string, secret: string) {
    let decoded: Payload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (e) {
        throw new UnauthorizedError("Invalid token");
    }
    if (decoded.iss !== JWT_ISSUER) {
        throw new UnauthorizedError("Invalid issuer");
    }
    if (!decoded.sub) {
        throw new UnauthorizedError("No user ID in token");
    }
    return decoded.sub;
}

export function getBearerToken(request: Request): string {
    const authorizationHeader = request.get("Authorization");
    if (!authorizationHeader) {
        throw new UnauthorizedError("No authorization header. No token provided");
    } 
    return authorizationHeader.split(" ")[1];
}