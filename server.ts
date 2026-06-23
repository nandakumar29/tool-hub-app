import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { TOOLS } from './src/data/tools';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize SQLite Database
const db = new Database('ratings.db');

// Create ratings table
db.exec(`
  CREATE TABLE IF NOT EXISTS tool_ratings (
    tool_id TEXT PRIMARY KEY,
    rating_sum REAL NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0
  )
`);

// Seed realistic initial ratings for all existing tools
const checkStmt = db.prepare('SELECT COUNT(*) as count FROM tool_ratings WHERE tool_id = ?');
const insertStmt = db.prepare('INSERT INTO tool_ratings (tool_id, rating_sum, rating_count) VALUES (?, ?, ?)');

db.transaction(() => {
  for (const tool of TOOLS) {
    const row = checkStmt.get(tool.id) as { count: number };
    if (row && row.count === 0) {
      // Seed a lively active rating space
      // Number of reviews: 15 to 140
      const count = Math.floor(Math.random() * 125) + 15;
      // Average stars: 4.3 to 4.9
      const ratingAvg = 4.3 + Math.random() * 0.6;
      const sum = parseFloat((count * ratingAvg).toFixed(1));
      insertStmt.run(tool.id, sum, count);
    }
  }
})();

// API Endpoints for Ratings
app.get('/api/ratings', (req, res) => {
  try {
    const stmt = db.prepare('SELECT tool_id, rating_sum, rating_count FROM tool_ratings');
    const rows = stmt.all() as { tool_id: string; rating_sum: number; rating_count: number }[];
    
    const ratingsMap: Record<string, { count: number; average: number }> = {};
    for (const row of rows) {
      ratingsMap[row.tool_id] = {
        count: row.rating_count,
        average: row.rating_count > 0 ? parseFloat((row.rating_sum / row.rating_count).toFixed(1)) : 0
      };
    }
    res.json({ success: true, ratings: ratingsMap });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ratings', (req, res) => {
  const { toolId, rating } = req.body;
  if (!toolId || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, error: 'Invalid tool id or rating value.' });
  }

  try {
    // Check if tool exists
    const checkTool = TOOLS.find(t => t.id === toolId);
    if (!checkTool) {
      return res.status(404).json({ success: false, error: 'Tool not found.' });
    }

    // Insert or Update rating
    const updateStmt = db.prepare(`
      INSERT INTO tool_ratings (tool_id, rating_sum, rating_count)
      VALUES (?, ?, 1)
      ON CONFLICT(tool_id) DO UPDATE SET
        rating_sum = rating_sum + EXCLUDED.rating_sum,
        rating_count = rating_count + 1
    `);
    
    updateStmt.run(toolId, rating);

    // Get updated values
    const selectStmt = db.prepare('SELECT rating_sum, rating_count FROM tool_ratings WHERE tool_id = ?');
    const val = selectStmt.get(toolId) as { rating_sum: number; rating_count: number };

    res.json({
      success: true,
      toolId,
      count: val.rating_count,
      average: parseFloat((val.rating_sum / val.rating_count).toFixed(1))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Explicit high-visibility route for Ads.txt crawler validation
app.get('/ads.txt', (req, res) => {
  res.header('Content-Type', 'text/plain; charset=utf-8');
  
  // High-reliability paths search in local deployment
  const locations = [
    path.join(process.cwd(), 'public', 'ads.txt'),
    path.join(process.cwd(), 'ads.txt'),
    path.join(process.cwd(), 'dist', 'ads.txt')
  ];

  for (const loc of locations) {
    if (fs.existsSync(loc)) {
      try {
        return res.sendFile(loc);
      } catch (e) {
        // Fall back to check next location or direct payload
      }
    }
  }

  // Double robust direct payload response fallback as final safeguard
  res.send('google.com, pub-5240099836324801, DIRECT, f08c47fec0942fa0');
});

// Setup Vite Dev Server / Static Assets Production Mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start full-stack server:', err);
});
