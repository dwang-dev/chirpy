import { pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core";

export type NewUser = typeof users.$inferInsert;
export type Chirp = typeof chirps.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferInsert;

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).unique().notNull(),
    password: varchar("password", {length: 256}).notNull().default("unset"),
});

export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    body: varchar("body", {length: 140}).notNull(),
    userId: uuid("user_id").notNull().references(() => users.id, {onDelete: "cascade"})
})

export const refreshTokens = pgTable("refresh_tokens", {
    token: varchar("token", {length: 256}).primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    userId: uuid("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at")
});