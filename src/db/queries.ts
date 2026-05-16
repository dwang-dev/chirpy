import { db } from "./index.js";
import { Chirp, chirps, NewUser, users } from "./schema.js";
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