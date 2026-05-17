import { getAPIKey, getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { insertUser, updateUser, upgradeUserMembership } from "../db/queries.js";
import { Request, Response } from "express";
import { BadReqError, NotFoundError, UnauthorizedError } from "../errors.js";
import { config } from "../config.js";

export async function handlerCreateUser(request: Request, response: Response): Promise<void> {
    const newUser = await insertUser({
        email: request.body.email, 
        password: await hashPassword(request.body.password)
    });
    response.status(201).send(newUser);
}

export async function handlerUpdateUser(request: Request, response: Response) {
    const email = request.body.email;
    const password = request.body.password;
    if (!email || !password) throw new BadReqError("Missing required fields");
    const token = getBearerToken(request);
    const userId = validateJWT(token, config.api.jwt_secret);
    const passwordHash = await hashPassword(request.body.password);
    const updatedDetails = {
        email: request.body.email,
        password: passwordHash
    }
    const user = await updateUser(updatedDetails, userId);
    response.status(200).send(updatedDetails);
}

export async function handlerPolkaWebhook(request: Request, response: Response) {
    if (getAPIKey(request) !== config.api.polka_key) {
        throw new UnauthorizedError("Invalid polka API key.");
    }
    if (request.body.event !== "user.upgraded") {
        response.status(204).send();
        return;
    }
    const user = await upgradeUserMembership(request.body.data.userId);
    if (!user) {
        throw new NotFoundError(`User not found.`);
    }
    response.status(204).send({});
}