import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { BadReqError, UnauthorizedError, ForbiddenError, NotFoundError, CustomError } from "./errors.js";
import { insertUser, deleteAllUsers, insertChirp, selectAllChirps } from "./db/queries.js";
import { config } from "./config.js";

const PROFANITIES = ["kerfuffle", "sharbert", "fornax"];

const app = express();
const PORT = 8080;
app.use(middlewareLogResponses, express.json());
app.use("/app", middlewareUpdateMetrics, express.static("./src/app"))
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
app.get("/api/healthz", handlerReadiness);
app.post("/api/users", handlerCreateUser);
app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", getAllChirps);
app.use(handlerErrors);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

function middlewareLogResponses(request: Request, response: Response, next: NextFunction): void {
    response.on("finish", () => {
        if (response.statusCode >= 300) {
            console.log(`[NON-OK] ${request.method} ${request.url} - Status: ${response.statusCode}`);
        } else {
            console.log(`[OK] ${request.method} ${request.url} - Status: ${response.statusCode}`);
        }
    });
    next();
}

function middlewareUpdateMetrics(request: Request, response: Response, next: NextFunction): void {
    config.api.fileserverHits++;
    next();
}

function handlerReadiness(request: Request, response: Response): void {
    response.set("Content-Type", "text/plain; charset=utf-8");
    response.status(200);
    response.send("OK");
}

function handlerMetrics(request: Request, response: Response): void {
    const text = `
    <html>
        <body>
            <h1>Welcome, Chirpy Admin</h1>
            <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
        </body>
    </html>
    `
    response.set("Content-Type", "text/html; charset=utf-8");
    response.send(text);
}

async function handlerReset(request: Request, response: Response): Promise<void> {
    config.api.fileserverHits = 0;
    if (process.env.PLATFORM === "dev") {
        response.status(200);
        await deleteAllUsers();
    } else {
        response.status(403);
    }
    response.send();    
}

function handlerErrors(error: any, request: Request, response: Response): void {
    error instanceof CustomError ? response.status(error.getStatus()) : response.status(500);
    response.send({"error": error.message});
}

async function handlerCreateUser(request: Request, response: Response): Promise<void> {
    const newUser = await insertUser({email: request.body.email});
    response.status(201);
    response.send(newUser);
}

async function handlerCreateChirp(request: Request, response: Response): Promise<void> {
    const requestBody = request.body;
    response.header("Content-Type", "application/json");
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
        userId: request.body.userId
    });
    response.status(201);
    response.send(chirp);
}

async function getAllChirps(request: Request, response: Response) {
    const chirps = await selectAllChirps();
    response.status(200).send(chirps);
};