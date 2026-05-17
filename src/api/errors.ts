import { CustomError } from "../errors.js";
import { Request, Response, NextFunction } from "express";

export function handlerErrors(error: any, request: Request, response: Response, next: NextFunction): void {
    if (error instanceof CustomError) {
        response.status(error.getStatus())
    } else {
        response.status(500);
    }
    response.send({"error": error.message});
}