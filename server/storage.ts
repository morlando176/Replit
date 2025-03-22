import { 
  users, 
  trackingEntries, 
  photos, 
  type User, 
  type InsertUser,
  type TrackingEntry,
  type InsertTrackingEntry,
  type Photo,
  type InsertPhoto
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Tracking methods
  getTrackingEntries(userId: number): Promise<TrackingEntry[]>;
  getTrackingEntryByDate(userId: number, date: Date): Promise<TrackingEntry | undefined>;
  createTrackingEntry(entry: InsertTrackingEntry): Promise<TrackingEntry>;
  updateTrackingEntry(id: number, entry: Partial<TrackingEntry>): Promise<TrackingEntry | undefined>;
  
  // Photo methods
  getPhotos(userId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trackingEntries: Map<number, TrackingEntry>;
  private photos: Map<number, Photo>;
  currentUserId: number;
  currentTrackingId: number;
  currentPhotoId: number;

  constructor() {
    this.users = new Map();
    this.trackingEntries = new Map();
    this.photos = new Map();
    this.currentUserId = 1;
    this.currentTrackingId = 1;
    this.currentPhotoId = 1;
    
    // Create default user
    this.createUser({
      username: "demo",
      password: "password",
      name: "John Doe",
      age: 32,
      ciLevel: 4,
      startingCi: 0,
      targetCi: 8,
      startDate: new Date("2023-01-15"),
      circumference: "5.2",
      length: "6.0",
      method: "T-Tape",
      tension: 500
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Tracking methods
  async getTrackingEntries(userId: number): Promise<TrackingEntry[]> {
    return Array.from(this.trackingEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTrackingEntryByDate(userId: number, date: Date): Promise<TrackingEntry | undefined> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.trackingEntries.values())
      .find(entry => 
        entry.userId === userId && 
        new Date(entry.date).toISOString().split('T')[0] === dateString
      );
  }

  async createTrackingEntry(entry: InsertTrackingEntry): Promise<TrackingEntry> {
    const id = this.currentTrackingId++;
    const trackingEntry: TrackingEntry = { ...entry, id };
    this.trackingEntries.set(id, trackingEntry);
    return trackingEntry;
  }

  async updateTrackingEntry(id: number, entryData: Partial<TrackingEntry>): Promise<TrackingEntry | undefined> {
    const entry = this.trackingEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...entryData };
    this.trackingEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  // Photo methods
  async getPhotos(userId: number): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter(photo => photo.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const id = this.currentPhotoId++;
    const newPhoto: Photo = { ...photo, id };
    this.photos.set(id, newPhoto);
    return newPhoto;
  }

  async deletePhoto(id: number): Promise<boolean> {
    return this.photos.delete(id);
  }
}

export const storage = new MemStorage();
