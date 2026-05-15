import { db } from "./index.js";
import { Chirp, chirps, NewUser, users } from "./schema.js";

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

/* Chirps table queries. */
export async function insertChirp(chirp: Chirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function selectAllChirps() {
    return db.select().from(chirps);
}