import { getBearerToken, validateJWT } from "../auth.js";
import { Request, Response } from "express"
import { config } from "../config.js";
import { BadReqError, ForbiddenError, NotFoundError, UnauthorizedError } from "../errors.js";
import { deleteChirp, insertChirp, selectAllChirps, selectChirp, selectChirpByUserId } from "../db/queries.js";

const PROFANITIES = ["kerfuffle", "sharbert", "fornax"];

export async function handlerCreateChirp(request: Request, response: Response): Promise<void> {
    const requestBody = request.body;
    const jwt = getBearerToken(request);
    const userId = validateJWT(jwt, config.api.jwt_secret);
    if (requestBody.body.length > 140) {
        throw new BadReqError("Chirp is too long. Max length is 140");
    }
    const words = requestBody.body.split(" ");
    const cleanedWords = words.map((word: string) => 
        PROFANITIES.includes(word.toLowerCase()) ? "****" : word
    );
    const cleanedBody = cleanedWords.join(" ");
    const chirp = await insertChirp({
        body: cleanedBody, 
        userId: userId
    });
    response.header("Content-Type", "application/json");
    response.status(201);
    response.send(chirp);
}

export async function getAllChirps(request: Request, response: Response) {
    const chirps = await selectAllChirps();
    response.status(200).send(chirps);
};

export async function getChirp(request: Request, response: Response) {
    const chirpId = request.params.chirpId;
    if (typeof chirpId !== "string") {
        throw new BadReqError(`Invalid Chirp ID: ${chirpId}`);
    }
    const chirp = await selectChirp(request.params.chirpId as string);
    if (!chirp) {
        throw new NotFoundError(`Chirp with id ${chirpId}`)
    } else {
        response.status(200).send(chirp); 
    }
}

export async function handleDeleteChirp(request: Request, response: Response) {
    const token = getBearerToken(request);
    const userId = validateJWT(token, config.api.jwt_secret);
    const chirpId = request.params.chirpId;
    if (!userId) {
        throw new UnauthorizedError("Invalid token.");
    }
    if (typeof chirpId !== "string") {
        throw new BadReqError(`Invalid Chirp ID: ${chirpId}`);
    }
    const res = await selectChirpByUserId(chirpId, userId);
    console.log(res);
    if (!await selectChirpByUserId(chirpId, userId)) {
        throw new ForbiddenError("Unauthorized to delete chirp");
    }
    if (!await deleteChirp(chirpId)) {
        throw new NotFoundError(`Could not delete chirp with id ${chirpId}`);
    }
    response.status(204).send();
}