import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { contentAnalysisSchema, scheduledPostSchema, socialAccountSchema } from "@shared/schema";
import { generateSocialContent, ContentGenerationError } from "./services/openai";
import { userSettingsSchema } from "@shared/schema";
import { parse as parseCookie } from "cookie";
import { IncomingMessage } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up authentication before registering routes
  await setupAuth(app);

  // Content History Routes
  app.get("/api/content-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const history = await storage.getContentHistory(req.user.id);
      res.json(history);
    } catch (error) {
      console.error('Error fetching content history:', error);
      res.status(500).json({ message: 'Failed to fetch content history' });
    }
  });

  app.post("/api/content-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const history = await storage.createContentHistory({
        userId: req.user.id,
        ...req.body
      });
      res.status(201).json(history);
    } catch (error) {
      console.error('Error creating content history:', error);
      res.status(500).json({ message: 'Failed to create content history' });
    }
  });

  app.delete("/api/content-history/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      await storage.deleteContentHistory(parseInt(req.params.id));
      res.sendStatus(200);
    } catch (error) {
      console.error('Error deleting content history:', error);
      res.status(500).json({ message: 'Failed to delete content history' });
    }
  });

  // Analysis Routes
  app.post("/api/analyze", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const validation = contentAnalysisSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid analysis data', errors: validation.error });
      }

      const content = await generateSocialContent(validation.data.content, 'twitter');

      const analysis = await storage.createContentAnalysis({
        userId: req.user.id,
        content: validation.data.content,
        sentiment: {
          label: content.tone,
          score: content.quality_metrics.clarity
        },
        engagementScore: content.engagement_prediction,
        hashtags: content.hashtags,
        createdAt: new Date().toISOString()
      });

      res.json(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      if (error instanceof ContentGenerationError) {
        res.status(400).json({ message: error.message, code: error.code });
      } else {
        res.status(500).json({ message: 'Failed to analyze content' });
      }
    }
  });

  app.get("/api/analyses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const analyses = await storage.getContentAnalyses(req.user.id);
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      res.status(500).json({ message: 'Failed to fetch analyses' });
    }
  });

  app.delete("/api/analyses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      await storage.deleteContentAnalysis(parseInt(req.params.id));
      res.sendStatus(200);
    } catch (error) {
      console.error('Error deleting analysis:', error);
      res.status(500).json({ message: 'Failed to delete analysis' });
    }
  });

  // User Settings Routes
  app.get("/api/settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      let settings = await storage.getUserSettings(req.user.id);
      if (!settings) {
        settings = await storage.updateUserSettings(req.user.id, {
          userId: req.user.id,
          theme: "system",
          emailNotifications: true,
          pushNotifications: true,
          weeklyDigest: true,
          contentLanguage: "en",
          autoSchedule: false,
        });
      }
      res.json(settings);
    } catch (error) {
      console.error('Error fetching user settings:', error);
      res.status(500).json({ message: 'Failed to fetch user settings' });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const validation = userSettingsSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid settings data', errors: validation.error });
      }

      const settings = await storage.updateUserSettings(req.user.id, validation.data);
      res.json(settings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      res.status(500).json({ message: 'Failed to update user settings' });
    }
  });

  // WebSocket server setup
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
    verifyClient: async (info: { origin: string; secure: boolean; req: IncomingMessage }, callback) => {
      try {
        const cookieHeader = info.req.headers.cookie;
        if (!cookieHeader) {
          console.log('WebSocket connection rejected: No cookie header');
          callback(false, 401, 'No authentication cookie found');
          return;
        }

        const cookies = parseCookie(cookieHeader);
        const sessionId = cookies['connect.sid'];

        if (!sessionId) {
          console.log('WebSocket connection rejected: No session cookie');
          callback(false, 401, 'No session cookie found');
          return;
        }

        // Get session from storage
        storage.sessionStore.get(sessionId.substring(2).split('.')[0], (err, session) => {
          if (err || !session) {
            console.log('WebSocket connection rejected: Invalid session');
            callback(false, 401, 'Invalid session');
            return;
          }

          if (!session.passport?.user) {
            console.log('WebSocket connection rejected: No user in session');
            callback(false, 401, 'No user in session');
            return;
          }

          console.log('WebSocket connection authorized for user:', session.passport.user);
          callback(true);
        });
      } catch (error) {
        console.error('WebSocket verification error:', error);
        callback(false, 500, 'Internal server error during authentication');
      }
    }
  });

  // WebSocket message handling
  wss.on('connection', async (ws, request) => {
    console.log('New WebSocket connection established');

    ws.send(JSON.stringify({
      type: 'connection_status',
      status: 'connected'
    }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'generate_content') {
          try {
            const content = await generateSocialContent(data.prompt, data.platform);

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'content_generated',
                content,
                timestamp: new Date().toISOString()
              }));
            }
          } catch (error) {
            console.error('Content generation error:', error);

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                code: error instanceof ContentGenerationError ? error.code : 'UNKNOWN_ERROR',
                message: error instanceof ContentGenerationError ? error.message : 'An unexpected error occurred'
              }));
            }
          }
        }
      } catch (error) {
        console.error('Message handling error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            code: 'MESSAGE_PARSE_ERROR',
            message: 'Invalid message format'
          }));
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}