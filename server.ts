import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { TOOLS } from './src/data/tools';

const app = express();
const PORT = 3000;

app.use(express.json());

// 🛡️ SECURITY PROTECTION INTERCEPTOR MIDDLEWARE
// Hardens security headers and strictly forbids direct access to sensitive configs, databases, and source files
app.use((req, res, next) => {
  // Hardened Browser Protections
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Prevent Directory Traversal, Hidden Resource Access, and Direct Queries for Sensitive Files
  const lowerPath = req.path.toLowerCase();
  const isProd = process.env.NODE_ENV === 'production';
  const forbiddenExtensions = isProd
    ? ['.db', '.sqlite', '.sqlite3', '.env', '.ts', '.tsx', '.sh', '.bak', '.log', '.git', '.sql', '.yml', '.yaml', 'config.json']
    : ['.db', '.sqlite', '.sqlite3', '.env', '.sh', '.bak', '.log', '.git', '.sql', '.yml', '.yaml', 'config.json'];
  
  const hasForbiddenExt = forbiddenExtensions.some(ext => lowerPath.endsWith(ext));
  const isDotFile = req.path.split('/').some(segment => segment.startsWith('.'));
  const isTraversal = req.path.includes('..');

  if (hasForbiddenExt || isDotFile || isTraversal) {
    return res.status(403).json({
      success: false,
      error: 'Security Notice: Direct access to database engine binaries, metadata configurations, or system files is strictly prohibited.'
    });
  }

  next();
});

// Initialize SQLite Database
const db = new Database('ratings.db');

// Create ratings, sessions, and activity log tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tool_ratings (
    tool_id TEXT PRIMARY KEY,
    rating_sum REAL NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS usage_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token TEXT UNIQUE NOT NULL,
    user_agent TEXT,
    platform TEXT,
    referrer TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token TEXT NOT NULL,
    action_type TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// Seed session and activity log telemetry for analytics dashboard if empty
const countSessions = db.prepare('SELECT COUNT(*) as count FROM usage_sessions').get() as { count: number };
if (countSessions && countSessions.count === 0) {
  const seedSessionsStmt = db.prepare(`
    INSERT INTO usage_sessions (session_token, user_agent, platform, referrer, created_at)
    VALUES (?, ?, ?, ?, datetime('now', ?, ?, ?))
  `);
  
  const seedActivitiesStmt = db.prepare(`
    INSERT INTO activity_logs (session_token, action_type, details, created_at)
    VALUES (?, ?, ?, datetime('now', ?, ?, ?))
  `);

  const platforms = ['macOS', 'Windows', 'Android', 'iOS', 'Linux'];
  const referrers = ['Direct', 'https://google.com', 'https://github.com', 'https://twitter.com', 'https://dev.to', 'https://linkedin.com'];
  const sampleTools = [
    'emi-calculator', 'sip-calculator', 'fd-calculator', 'gst-calculator',
    'json-formatter', 'base64-encode-decode', 'jwt-decoder', 'sha256-generator',
    'json-to-model', 'code-compiler-converter', 'password-generator',
    'qr-generator', 'word-counter', 'image-compressor', 'image-resizer'
  ];

  db.transaction(() => {
    // Seed records distributed over the last 7 days (day -6 to day 0)
    for (let day = -6; day <= 0; day++) {
      // 15 to 35 sessions per day
      const numSessions = Math.floor(Math.random() * 20) + 15;
      for (let s = 0; s < numSessions; s++) {
        const randToken = 'sess_seed_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now() + '_' + day + '_' + s;
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        
        const randRef = Math.random();
        let referrer = 'Direct';
        if (randRef >= 0.4 && randRef < 0.7) {
          referrer = 'https://google.com';
        } else if (randRef >= 0.7) {
          referrer = referrers[Math.floor(Math.random() * referrers.length)];
        }

        const userAgent = `Mozilla/5.0 (${
          platform === 'Windows' ? 'Windows NT 10.0; Win64; x64' :
          platform === 'macOS' ? 'Macintosh; Intel Mac OS X 10_15_7' :
          platform === 'Android' ? 'Linux; Android 13' :
          platform === 'iOS' ? 'iPhone; CPU iPhone OS 16_5 like Mac OS X' :
          'X11; Linux x86_64'
        }) AppleWebKit/537.36`;
        
        const hour = Math.floor(Math.random() * 23);
        const min = Math.floor(Math.random() * 59);

        const mod1 = `${day} days`;
        const mod2 = `+${hour} hours`;
        const mod3 = `+${min} minutes`;
        
        seedSessionsStmt.run(randToken, userAgent, platform, referrer, mod1, mod2, mod3);

        // Record page entry navigation event
        seedActivitiesStmt.run(randToken, 'navigate', 'home', mod1, mod2, mod3);

        // Record 1 to 3 tool opening sessions
        const numToolsUsed = Math.floor(Math.random() * 3) + 1;
        for (let t = 0; t < numToolsUsed; t++) {
          const randTool = sampleTools[Math.floor(Math.random() * sampleTools.length)];
          const tHour = (hour + t + 1) % 24;
          const tMin = Math.floor(Math.random() * 59);
          const tMod1 = `${day} days`;
          const tMod2 = `+${tHour} hours`;
          const tMod3 = `+${tMin} minutes`;
          
          seedActivitiesStmt.run(randToken, 'tool_use', randTool, tMod1, tMod2, tMod3);

          // 25% chance of submitting a review/rating
          if (Math.random() > 0.75) {
            const seedRating = Math.floor(Math.random() * 2) + 4; // stars 4 or 5
            seedActivitiesStmt.run(randToken, 'rate', `${randTool}:${seedRating}`, tMod1, tMod2, tMod3);
          }
        }
      }
    }
  })();
}

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

// API Endpoints for Session Telemetry & Tracking
app.post('/api/sessions/register', (req, res) => {
  const { sessionToken, userAgent, platform, referrer } = req.body;
  if (!sessionToken) {
    return res.status(400).json({ success: false, error: 'Missing sessionToken' });
  }

  try {
    const insertSession = db.prepare(`
      INSERT OR IGNORE INTO usage_sessions (session_token, user_agent, platform, referrer)
      VALUES (?, ?, ?, ?)
    `);
    
    insertSession.run(sessionToken, userAgent || null, platform || null, referrer || null);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sessions/log', (req, res) => {
  const { sessionToken, actionType, details } = req.body;
  if (!sessionToken || !actionType) {
    return res.status(400).json({ success: false, error: 'Missing required parameters' });
  }

  try {
    const insertLog = db.prepare(`
      INSERT INTO activity_logs (session_token, action_type, details)
      VALUES (?, ?, ?)
    `);
    
    insertLog.run(sessionToken, actionType, details || null);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Authentication Setup
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin-nandakumar';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'Drowssap@123$';
const ADMIN_TOKEN = 'admin-secure-token-9566966001308351';

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }
  return res.status(401).json({ success: false, error: 'Invalid username or password' });
});

// Admin Analytics Fetch Engine
app.get('/api/admin/analytics', (req, res) => {
  const authHeader = req.headers['x-admin-token'];
  if (authHeader !== ADMIN_TOKEN) {
    return res.status(401).json({ success: false, error: 'Unauthorized credentials' });
  }

  try {
    // 1. Core aggregates
    const totalSessions = (db.prepare('SELECT COUNT(*) as count FROM usage_sessions').get() as any).count;
    const totalActivities = (db.prepare('SELECT COUNT(*) as count FROM activity_logs').get() as any).count;
    
    // 2. Client platforms distribution
    const platforms = db.prepare(`
      SELECT platform, COUNT(*) as count 
      FROM usage_sessions 
      GROUP BY platform 
      ORDER BY count DESC
    `).all();

    // 3. Traffic sources / referrer attribution
    const referrers = db.prepare(`
      SELECT referrer, COUNT(*) as count 
      FROM usage_sessions 
      GROUP BY referrer 
      ORDER BY count DESC
    `).all();

    // 4. Most active calculator/developer tools
    const toolUsage = db.prepare(`
      SELECT details as tool_id, COUNT(*) as count 
      FROM activity_logs 
      WHERE action_type = 'tool_use' 
      GROUP BY details 
      ORDER BY count DESC 
      LIMIT 10
    `).all();

    // 5. Grid/Timeline parameters (Last 14 active calendar days)
    const dailyStats = db.prepare(`
      SELECT 
        date(created_at) as day_date, 
        COUNT(DISTINCT session_token) as active_users,
        COUNT(*) as total_actions
      FROM activity_logs
      GROUP BY day_date
      ORDER BY day_date ASC
      LIMIT 14
    `).all();

    // 6. Recent activity timeline audit log feed
    const recentLogs = db.prepare(`
      SELECT 
        l.id, 
        l.session_token, 
        l.action_type, 
        l.details, 
        l.created_at,
        s.platform,
        s.referrer
      FROM activity_logs l
      LEFT JOIN usage_sessions s ON l.session_token = s.session_token
      ORDER BY l.created_at DESC
      LIMIT 30
    `).all();

    res.json({
      success: true,
      summary: {
        totalSessions,
        totalActivities,
      },
      platforms,
      referrers,
      toolUsage,
      dailyStats,
      recentLogs
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
