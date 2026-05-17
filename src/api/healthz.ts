import { Request, Response } from "express";

export function handlerReadiness(request: Request, response: Response): void {
    response.set("Content-Type", "text/plain; charset=utf-8");
    response.status(200);
    response.send("OK");
}
