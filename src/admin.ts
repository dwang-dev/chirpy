import { Request, Response } from "express";
import { config } from "./config.js";
import { deleteAllUsers } from "./db/queries.js";
import { ForbiddenError } from "./errors.js";

export function handlerMetrics(request: Request, response: Response): void {
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

export async function handlerReset(request: Request, response: Response): Promise<void> {
    config.api.fileserverHits = 0;
    if (process.env.PLATFORM === "dev") {
        response.status(200);
        await deleteAllUsers();
    } else {
        throw new ForbiddenError("Forbidden: Not a developer.")
    }
    response.send();    
}