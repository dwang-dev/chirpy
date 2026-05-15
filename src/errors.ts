export abstract class CustomError extends Error {
    public abstract getStatus(): number;

}

export class BadReqError extends CustomError {
    public static status = 400;
    constructor(message: string) {
        super(message);
    }
    public getStatus() {
        return BadReqError.status;
    }
}

export class UnauthorizedError extends CustomError {
    public static status = 401;

    constructor(message: string) {
        super(message);
    }

    public getStatus() {
        return UnauthorizedError.status;
    }
}

export class ForbiddenError extends CustomError {
    public static status = 403;

    constructor(message: string) {
        super(message);
    }

    public getStatus() {
        return ForbiddenError.status;
    }
}

export class NotFoundError extends CustomError {
    public static status = 404;

    constructor(message: string) {
        super(message);
    }

    public getStatus() {
        return NotFoundError.status;
    }
}