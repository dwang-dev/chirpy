import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from "../auth.js";
import { config } from "../config.js";
import { insertRefreshToken, selectRefreshToken, selectUserByEmail, updateRefreshToken } from "../db/queries.js";
import { UnauthorizedError } from "../errors.js";
import { Request, Response } from "express";

export async function handlerLogin(request: Request, response: Response) {
    const user = await selectUserByEmail(request.body.email);
    if (!user) {
        throw new UnauthorizedError(`Could not authenticate user`);
    }
    if (!(await checkPasswordHash(user.password, request.body.password))) {
        throw new UnauthorizedError(`Could not authenticate user`);
    }
    const jwt = makeJWT(user.id, config.api.jwt_timeout, config.api.jwt_secret);
    const refreshToken = makeRefreshToken();
    const refreshTokenObj = await insertRefreshToken({
        userId: user.id,
        token: refreshToken
    });
    if (!refreshTokenObj) {
        throw new Error("could not save refresh token");
    }
    response.status(200).send({
        ...user, 
        token: jwt, 
        refreshToken: refreshToken
    });
}

export async function handlerRefresh(request: Request, response: Response) {
    const oldTokenStr = getBearerToken(request);
    const tokenObj = await selectRefreshToken(oldTokenStr);
    if (!tokenObj || tokenObj.revokedAt !== null) {
        throw new UnauthorizedError(`Invalid refresh token ${oldTokenStr}`);
    }
    const newAccessToken = makeJWT(tokenObj.userId, config.api.jwt_timeout, config.api.jwt_secret);
    response.status(200).send({
        token: newAccessToken
    });
}

export async function handlerRevoke(request: Request, response: Response) {
    const oldTokenStr = getBearerToken(request);
    const tokenObj = await selectRefreshToken(oldTokenStr);
    if (!tokenObj) {
        throw new UnauthorizedError(`Invalid refresh token ${oldTokenStr}`);
    }
    const updatedTokenObj = await updateRefreshToken({
        token: oldTokenStr,
        userId: tokenObj.userId,
        updatedAt: new Date(),
        revokedAt: new Date(),
    });
    response.status(204).send();
}