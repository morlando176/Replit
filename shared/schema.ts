import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Profile Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  age: integer("age"),
  ciLevel: integer("ci_level").default(0),
  startingCi: integer("starting_ci").default(0),
  targetCi: integer("target_ci").default(8),
  startDate: date("start_date").default(new Date()),
  circumference: text("circumference"),
  length: text("length"),
  method: text("method"),
  tension: integer("tension").default(500),
});

// Daily Tracking Entry Schema
export const trackingEntries = pgTable("tracking_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  methodUsed: text("method_used").notNull(),
  hoursWorn: integer("hours_worn").notNull(),
  tensionUsed: integer("tension_used"),
  comfortLevel: integer("comfort_level"),
  notes: text("notes"),
  day: integer("day"), // Day number in restoration journey
});

// Photos Schema
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  filename: text("filename").notNull(),
  ciLevel: integer("ci_level"),
  day: integer("day"), // Day number in restoration journey
  notes: text("notes"),
  isReference: boolean("is_reference").default(false), // Flag to indicate if this is a reference photo
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertTrackingEntrySchema = createInsertSchema(trackingEntries).omit({ id: true });
export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TrackingEntry = typeof trackingEntries.$inferSelect;
export type InsertTrackingEntry = z.infer<typeof insertTrackingEntrySchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
