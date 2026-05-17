import { db } from "./index.js";
import { Chirp, chirps, User, RefreshToken, refreshTokens, users } from "./schema.js";
import { and, eq, sql } from "drizzle-orm";

/* User table queries. */
export async function insertUser(user: User) {
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

export async function updateUser(user: User, userId: string) {
    const [result] = await db
        .update(users)
        .set(user)
        .where(eq(users.id, userId))
        .returning();
    return result;
}

export async function upgradeUserMembership(userId: string) {
    const [result] = await db
        .update(users)
        .set({isChirpyRed: true})
        .where(eq(users.id, userId))
        .returning();
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

export async function selectChirpByUserId(chirpId: string, userId: string) {
    const [result] = await db
        .select()
        .from(chirps)
        .where(and(eq(chirps.id, chirpId), eq(chirps.userId, userId)));
    return result;
}

export async function selectAllChirps(userId: string | undefined) {
    if (!userId) {
        return await db.select().from(chirps);
    } else {
        return await db.select().from(chirps).where(eq(chirps.userId, userId));
    }
}

export async function deleteChirp(chirpId: string) {
    const [result] = await db
        .delete(chirps)
        .where(eq(chirps.id, chirpId))
        .returning();
    return result;
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