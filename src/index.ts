import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { config } from "./config.js";
import { handlerCreateUser, handlerPolkaWebhook, handlerUpdateUser } from "./api/users.js";
import { getAllChirps, getChirp, handleDeleteChirp, handlerCreateChirp } from "./api/chirps.js";
import { handlerLogin, handlerRefresh, handlerRevoke } from "./api/auth.js";
import { handlerErrors } from "./api/errors.js";
import { handlerReadiness } from "./api/healthz.js";
import { handlerMetrics, handlerReset } from "./admin.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses, express.json());
app.use("/app", middlewareUpdateMetrics, express.static("./src/app"));

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.get("/api/healthz", handlerReadiness);
app.post("/api/users", handlerCreateUser);
app.put("/api/users", handlerUpdateUser);
app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", getAllChirps);
app.get("/api/chirps/:chirpId", getChirp);
app.delete("/api/chirps/:chirpId", handleDeleteChirp);
app.post("/api/login", handlerLogin);
app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);
app.post("/api/polka/webhooks", handlerPolkaWebhook);
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