import express, { NextFunction } from "express";
import { Request, Response } from "express";

type APIConfig = {
    fileserverHits: number;
};

const PROFANITIES = ["kerfuffle", "sharbert", "fornax"];

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
    apiConfig.fileserverHits++;
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
            <p>Chirpy has been visited ${apiConfig.fileserverHits} times!</p>
        </body>
    </html>
    `
    response.set("Content-Type", "text/html; charset=utf-8");
    response.send(text);
}

function handlerResetMetrics(request: Request, response: Response): void {
    apiConfig.fileserverHits = 0;
    response.send("");
}

function handlerValidateChirp(request: Request, response: Response): void {
    const requestBody = request.body;
    response.header("Content-Type", "application/json");
    if (requestBody.body.length > 140) {
        throw new Error("Chirp length too long");
    } else {
        const words = requestBody.body.split(" ");
        const cleanedWords = words.map((word: string) => PROFANITIES.includes(word.toLowerCase()) ? "****" : word);
        const cleanedBody = cleanedWords.join(" ");
        response.status(200);
        response.send({cleanedBody: cleanedBody});
    }
}

function handlerErrors(error: any, request: Request, response: Response, next: NextFunction): void {
    response.status(500);
    console.log(`An error occured: ${error}`);
    const responseBody = {
        "error": "Something went wrong on our end"
    }
    response.send(responseBody);
}

const app = express();
const PORT = 8080;
app.use(middlewareLogResponses, express.json());
app.use("/app", middlewareUpdateMetrics, express.static("./src/app"))
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerResetMetrics);
app.post("/api/validate_chirp", handlerValidateChirp);
app.use(handlerErrors);
const apiConfig: APIConfig = {fileserverHits: 0};
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});