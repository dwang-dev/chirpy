import { db } from "./index.js";
import { Chirp, chirps, NewUser, RefreshToken, refreshTokens, users } from "./schema.js";
import { eq } from "drizzle-orm";

/* User table queries. */
export async function insertUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function deleteAllUsers() {
    await db.delete(users);
}

export async function selectUserByEmail(email: string) {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
}

/* Chirps table queries. */
export async function insertChirp(chirp: Chirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function selectChirp(chirpId: string) {
    const [result] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, chirpId));
    return result;
}

export async function selectAllChirps() {
    return await db.select().from(chirps);
}

/* Refresh token queries. */
export async function selectRefreshToken(refreshToken: string) {
    const [result] = await db
        .select()
        .from(refreshTokens)
        .where((eq(refreshTokens.token, refreshToken)));
    return result;
}

export async function updateRefreshToken(token: RefreshToken) {
    const [result] = await db
        .update(refreshTokens)
        .set(token)
        .where(eq(refreshTokens.userId, token.userId))
        .returning();
    return result;
}

export async function insertRefreshToken(refreshToken: RefreshToken) {
    const [result] = await db
        .insert(refreshTokens)
        .values(refreshToken)
        .onConflictDoNothing()
        .returning();
    return result;
}