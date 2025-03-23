import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertTrackingEntrySchema, insertPhotoSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Setup storage for photo uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for zod validation errors
  const handleErrors = (fn: (req: Request, res: Response) => Promise<void>) => {
    return async (req: Request, res: Response) => {
      try {
        await fn(req, res);
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({ 
            message: "Validation error", 
            errors: fromZodError(error).message 
          });
        } else {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
        }
      }
    };
  };

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/user/:id", handleErrors(async (req, res) => {
    const userId = parseInt(req.params.id);
    const userData = req.body;
    
    console.log('Received user update request for ID:', userId);
    console.log('User data:', userData);
    
    const user = await storage.updateUser(userId, userData);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log('User updated successfully:', user);
    
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));

  // Tracking entries routes
  app.get("/api/tracking/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const entries = await storage.getTrackingEntries(userId);
    res.json(entries);
  });

  app.get("/api/tracking/:userId/:date", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const dateStr = req.params.date;
    const date = new Date(dateStr);
    
    console.log('GET tracking entry by date:', dateStr, 'parsed as:', date.toISOString());
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    
    const entry = await storage.getTrackingEntryByDate(userId, dateStr);
    console.log('Found entry:', entry);
    
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    
    res.json(entry);
  });

  app.post("/api/tracking", handleErrors(async (req, res) => {
    const entryData = insertTrackingEntrySchema.parse(req.body);
    console.log('Creating/updating tracking entry with data:', entryData);
    
    // Check if entry already exists for this date before creating a new one
    // Just pass the date string directly instead of creating a new Date object
    const existingEntry = await storage.getTrackingEntryByDate(
      entryData.userId,
      entryData.date
    );
    
    if (existingEntry) {
      console.log('Found existing entry for this date, updating:', existingEntry);
      // Update existing entry instead of creating a new one
      const updated = await storage.updateTrackingEntry(existingEntry.id, entryData);
      return res.json(updated);
    }
    
    console.log('No existing entry found, creating new one');
    // Create new entry only if one doesn't exist for this date
    const entry = await storage.createTrackingEntry(entryData);
    res.status(201).json(entry);
  }));

  app.put("/api/tracking/:id", handleErrors(async (req, res) => {
    const entryId = parseInt(req.params.id);
    const entryData = req.body;
    
    const entry = await storage.updateTrackingEntry(entryId, entryData);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    
    res.json(entry);
  }));

  // Photo routes
  app.get("/api/photos", async (req, res) => {
    // Default to user 1 for single-user prototype
    // Only return non-reference photos by default
    const photos = await storage.getPhotos(1, false);
    res.json(photos);
  });
  
  app.get("/api/photos/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const isReference = req.query.reference === 'true';
    const photos = await storage.getPhotos(userId, isReference);
    res.json(photos);
  });
  
  app.get("/api/reference-photos", async (req, res) => {
    // This endpoint is specifically for reference photos
    const photos = await storage.getReferencePhotos();
    res.json(photos);
  });

  app.post("/api/photos", upload.single("photo"), handleErrors(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No photo uploaded" });
    }
    
    try {
      // Convert form data to appropriate types
      const photoData = insertPhotoSchema.parse({
        ...req.body,
        userId: parseInt(req.body.userId),
        date: req.body.date || new Date().toISOString(),
        filename: req.file.filename,
        ciLevel: req.body.ciLevel ? parseInt(req.body.ciLevel) : null,
        day: req.body.day ? parseInt(req.body.day) : null,
        notes: req.body.notes || null,
        isReference: req.body.isReference === 'true'
      });
      console.log('Parsed photo data:', photoData);
      
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      console.error('Error processing photo upload:', error);
      res.status(400).json({ message: 'Failed to process photo data', error: String(error) });
    }
  }));

  app.delete("/api/photos/:id", async (req, res) => {
    const photoId = parseInt(req.params.id);
    const success = await storage.deletePhoto(photoId);
    
    if (!success) {
      return res.status(404).json({ message: "Photo not found" });
    }
    
    res.json({ success: true });
  });
  
  // Endpoint to delete a tracking entry
  app.delete("/api/tracking/:id", async (req, res) => {
    const entryId = parseInt(req.params.id);
    const success = await storage.deleteTrackingEntry(entryId);
    
    if (!success) {
      return res.status(404).json({ message: "Entry not found" });
    }
    
    res.json({ success: true });
  });

  // Serve uploaded files
  app.get("/uploads/:filename", (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(uploadsDir, filename));
  });

  // Simple route to check server status
  app.get("/api", (_req, res) => {
    res.json({ message: "API is running" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
