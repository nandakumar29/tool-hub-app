import express from 'express';
import path from 'path';
import fs from 'fs';
import { TOOLS } from './src/data/tools';
import { BLOG_ARTICLES } from './src/data/blogs';
import dotenv from 'dotenv';

dotenv.config();

// Define a pure JS file-persisted JSON database adapter to guarantee node-compatibility on serverless host systems (e.g., Vercel)
class PureJS_JSON_DB {
  private filepath: string;
  private data: {
    tool_ratings: Array<{ tool_id: string; rating_sum: number; rating_count: number }>;
    usage_sessions: Array<{
      id: number;
      session_token: string;
      user_agent: string | null;
      platform: string | null;
      referrer: string | null;
      created_at: string;
    }>;
    activity_logs: Array<{
      id: number;
      session_token: string;
      action_type: string;
      details: string | null;
      created_at: string;
    }>;
    admin_users: Array<{
      username: string;
      password_hash: string;
      created_at: string;
    }>;
  };

  constructor(filepath: string) {
    this.filepath = filepath;
    this.data = {
      tool_ratings: [],
      usage_sessions: [],
      activity_logs: [],
      admin_users: []
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filepath)) {
        const raw = fs.readFileSync(this.filepath, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          tool_ratings: parsed.tool_ratings || [],
          usage_sessions: parsed.usage_sessions || [],
          activity_logs: parsed.activity_logs || [],
          admin_users: parsed.admin_users || []
        };
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load database file, using in-memory fallbacks", e);
    }
  }

  private save() {
    try {
      const dir = path.dirname(this.filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error("Failed to save database file", e);
    }
  }

  exec(sql: string) {
    return this;
  }

  transaction(fn: (...args: any[]) => any) {
    const self = this;
    return function(...args: any[]) {
      const res = fn(...args);
      self.save();
      return res;
    };
  }

  prepare(sql: string) {
    const trimmed = sql.trim().replace(/\s+/g, ' ');
    const self = this;

    return {
      run(...args: any[]) {
        let affected = 0;

        if (trimmed.includes("DELETE FROM usage_sessions WHERE session_token LIKE")) {
          const originalLen = self.data.usage_sessions.length;
          self.data.usage_sessions = self.data.usage_sessions.filter(s => !s.session_token.startsWith('sess_seed_'));
          affected = originalLen - self.data.usage_sessions.length;
        } else if (trimmed.includes("DELETE FROM activity_logs WHERE session_token LIKE")) {
          const originalLen = self.data.activity_logs.length;
          self.data.activity_logs = self.data.activity_logs.filter(l => !l.session_token.startsWith('sess_seed_'));
          affected = originalLen - self.data.activity_logs.length;
        } else if (trimmed.includes("DELETE FROM tool_ratings")) {
          affected = self.data.tool_ratings.length;
          self.data.tool_ratings = [];
        } else if (trimmed.startsWith("INSERT INTO tool_ratings") && trimmed.includes("ON CONFLICT(tool_id) DO UPDATE SET")) {
          const toolId = args[0];
          const ratingSum = args[1];
          const found = self.data.tool_ratings.find(r => r.tool_id === toolId);
          if (found) {
            found.rating_sum += ratingSum;
            found.rating_count += 1;
          } else {
            self.data.tool_ratings.push({ tool_id: toolId, rating_sum: ratingSum, rating_count: 1 });
          }
          affected = 1;
        } else if (trimmed.startsWith("INSERT OR IGNORE INTO usage_sessions")) {
          const session_token = args[0];
          const user_agent = args[1] || null;
          const platform = args[2] || null;
          const referrer = args[3] || null;
          const exists = self.data.usage_sessions.some(s => s.session_token === session_token);
          if (!exists) {
            const nextId = self.data.usage_sessions.reduce((max, s) => s.id > max ? s.id : max, 0) + 1;
            self.data.usage_sessions.push({
              id: nextId,
              session_token,
              user_agent,
              platform,
              referrer,
              created_at: new Date().toISOString()
            });
            affected = 1;
          }
        } else if (trimmed.startsWith("INSERT INTO activity_logs")) {
          const session_token = args[0];
          const action_type = args[1];
          const details = args[2] || null;
          const nextId = self.data.activity_logs.reduce((max, l) => l.id > max ? l.id : max, 0) + 1;
          self.data.activity_logs.push({
            id: nextId,
            session_token,
            action_type,
            details,
            created_at: new Date().toISOString()
          });
          affected = 1;
        } else if (trimmed.startsWith("INSERT INTO admin_users") || trimmed.startsWith("INSERT OR IGNORE INTO admin_users")) {
          const username = args[0];
          const password_hash = args[1];
          const exists = self.data.admin_users.some(u => u.username.toLowerCase() === (username || '').toLowerCase());
          if (!exists) {
            self.data.admin_users.push({
              username,
              password_hash,
              created_at: new Date().toISOString()
            });
            affected = 1;
          }
        }

        self.save();
        return { changes: affected, lastInsertRowid: 0 };
      },

      get(...args: any[]): any {
        if (trimmed.includes("SELECT COUNT(*) as count FROM usage_sessions")) {
          return { count: self.data.usage_sessions.length };
        } else if (trimmed.includes("SELECT COUNT(*) as count FROM activity_logs")) {
          return { count: self.data.activity_logs.length };
        } else if (trimmed.includes("SELECT rating_sum, rating_count FROM tool_ratings WHERE tool_id = ?")) {
          const toolId = args[0];
          const r = self.data.tool_ratings.find(x => x.tool_id === toolId);
          return r ? { rating_sum: r.rating_sum, rating_count: r.rating_count } : undefined;
        } else if (trimmed.includes("FROM admin_users WHERE username = ?")) {
          const searchUser = args[0];
          const found = self.data.admin_users.find(u => u.username.toLowerCase() === (searchUser || '').toLowerCase());
          return found ? { username: found.username, password_hash: found.password_hash } : undefined;
        }
        return undefined;
      },

      all(...args: any[]): any[] {
        if (trimmed.includes("SELECT details FROM activity_logs WHERE action_type = 'rate' AND session_token NOT LIKE 'sess_seed_%'")) {
          return self.data.activity_logs
            .filter(l => l.action_type === 'rate' && !l.session_token.startsWith('sess_seed_'))
            .map(l => ({ details: l.details || '' }));
        } else if (trimmed.includes("SELECT tool_id, rating_sum, rating_count FROM tool_ratings")) {
          return self.data.tool_ratings.map(r => ({
            tool_id: r.tool_id,
            rating_sum: r.rating_sum,
            rating_count: r.rating_count
          }));
        } else if (trimmed.includes("FROM usage_sessions GROUP BY platform")) {
          const counts: Record<string, number> = {};
          self.data.usage_sessions.forEach(s => {
            const p = s.platform || 'Unknown';
            counts[p] = (counts[p] || 0) + 1;
          });
          return Object.entries(counts)
            .map(([platform, count]) => ({ platform, count }))
            .sort((a, b) => b.count - a.count);
        } else if (trimmed.includes("FROM usage_sessions GROUP BY referrer")) {
          const counts: Record<string, number> = {};
          self.data.usage_sessions.forEach(s => {
            const r = s.referrer || 'Direct';
            counts[r] = (counts[r] || 0) + 1;
          });
          return Object.entries(counts)
            .map(([referrer, count]) => ({ referrer, count }))
            .sort((a, b) => b.count - a.count);
        } else if (trimmed.includes("FROM activity_logs WHERE action_type = 'tool_use' GROUP BY details")) {
          const counts: Record<string, number> = {};
          self.data.activity_logs
            .filter(l => l.action_type === 'tool_use')
            .forEach(l => {
              const tid = l.details || 'unknown';
              counts[tid] = (counts[tid] || 0) + 1;
            });
          return Object.entries(counts)
            .map(([tool_id, count]) => ({ tool_id, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        } else if (trimmed.includes("COUNT(DISTINCT session_token) as active_users")) {
          const days: Record<string, { active_users_set: Set<string>; total_actions: number }> = {};
          self.data.activity_logs.forEach(l => {
            const day_date = (l.created_at || '').substring(0, 10) || new Date().toISOString().substring(0, 10);
            if (!days[day_date]) {
              days[day_date] = { active_users_set: new Set(), total_actions: 0 };
            }
            days[day_date].active_users_set.add(l.session_token);
            days[day_date].total_actions += 1;
          });
          return Object.entries(days)
            .map(([day_date, info]) => ({
              day_date,
              active_users: info.active_users_set.size,
              total_actions: info.total_actions
            }))
            .sort((a, b) => a.day_date.localeCompare(b.day_date))
            .slice(0, 14);
        } else if (trimmed.includes("LEFT JOIN usage_sessions s ON l.session_token = s.session_token")) {
          const sessMap = new Map<string, typeof self.data.usage_sessions[0]>();
          self.data.usage_sessions.forEach(s => {
            sessMap.set(s.session_token, s);
          });
          return self.data.activity_logs
            .map(l => {
              const s = sessMap.get(l.session_token);
              return {
                id: l.id,
                session_token: l.session_token,
                action_type: l.action_type,
                details: l.details,
                created_at: l.created_at,
                platform: s ? s.platform : null,
                referrer: s ? s.referrer : null
              };
            })
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, 30);
        }
        return [];
      }
    };
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Admin Authentication Setup
const cleanEnvVar = (val: string | undefined, defaultVal: string): string => {
  if (!val) return defaultVal;
  let str = val.trim();
  // Strip outer quotes if present
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1);
  }
  return str.trim();
};

const ADMIN_USER = cleanEnvVar(process.env.ADMIN_USERNAME, 'admin-nandakumar');
const ADMIN_PASS = cleanEnvVar(process.env.ADMIN_PASSWORD, 'Drowssap@123$');
const ADMIN_TOKEN = 'admin-secure-token-9566966001308351';

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

// Initialize robust pure-JS file-persisted JSON database
let dbPath = path.join(process.cwd(), 'ratings_db.json');
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  dbPath = path.join('/tmp', 'ratings_db.json');
}
const db = new PureJS_JSON_DB(dbPath);

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

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed default admin user if none exists in the SQLite DB
try {
  const existingAdmin = db.prepare("SELECT username, password_hash FROM admin_users WHERE username = ?").get(ADMIN_USER);
  if (!existingAdmin) {
    db.prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)").run(ADMIN_USER, ADMIN_PASS);
    console.log(`[Admin SQLite DB] Seeded default admin user: "${ADMIN_USER}"`);
  }
} catch (err) {
  console.error("Failed to seed admin user:", err);
}

// Prune all pre-seeded dummy telemetry and ratings, then preserve only genuine user sessions
try {
  db.transaction(() => {
    // Delete all seeded sessions and activities
    db.prepare("DELETE FROM usage_sessions WHERE session_token LIKE 'sess_seed_%'").run();
    db.prepare("DELETE FROM activity_logs WHERE session_token LIKE 'sess_seed_%'").run();
    
    // Reset tool_ratings table entirely to remove seeded random values
    db.prepare("DELETE FROM tool_ratings").run();
    
    // Re-calculate rating_sum and rating_count dynamically based on genuine user 'rate' events in activity_logs
    const realRatings = db.prepare(`
      SELECT details 
      FROM activity_logs 
      WHERE action_type = 'rate' AND session_token NOT LIKE 'sess_seed_%'
    `).all() as { details: string }[];
    
    const insertRating = db.prepare(`
      INSERT INTO tool_ratings (tool_id, rating_sum, rating_count)
      VALUES (?, ?, 1)
      ON CONFLICT(tool_id) DO UPDATE SET
        rating_sum = rating_sum + EXCLUDED.rating_sum,
        rating_count = rating_count + 1
    `);
    
    for (const row of realRatings) {
      if (row.details && row.details.includes(':')) {
        const parts = row.details.split(':');
        const toolId = parts[0];
        const rating = parseInt(parts[1], 10);
        if (toolId && !isNaN(rating) && rating >= 1 && rating <= 5) {
          insertRating.run(toolId, rating);
        }
      }
    }
  })();
  console.log('🛡️ SQLite Pruning Complete: Cleaned all synthetic dataset and preserved genuine logs.');
} catch (err) {
  console.error('Failed to clean mock records:', err);
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

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const userClean = (username || '').trim();
  const passClean = (password || '').trim();

  try {
    // 1. Attempt SQLite DB authentication
    const dbUser = db.prepare("SELECT username, password_hash FROM admin_users WHERE username = ?").get(userClean);
    if (dbUser && dbUser.password_hash === passClean) {
      console.log(`[Admin Login] Authenticated via SQLite DB for user: "${userClean}"`);
      return res.json({ success: true, token: ADMIN_TOKEN });
    }
  } catch (err: any) {
    console.error('[Admin Login] SQLite DB query error:', err);
  }

  // 2. Fallback code/env-level authentication (resilience fallback)
  const userMatches = 
    userClean.toLowerCase() === ADMIN_USER.toLowerCase() ||
    userClean.toLowerCase() === 'admin-nandakumar' ||
    userClean.toLowerCase() === 'admin' ||
    userClean.toLowerCase() === 'nanduthazhath96@gmail.com' ||
    userClean.toLowerCase() === 'nandu';

  const passMatches = 
    passClean === ADMIN_PASS || 
    passClean === 'Drowssap@123$';

  console.log(`[Admin Login] Fallback check: User matches: ${userMatches}, Pass matches: ${passMatches}`);

  if (userMatches && passMatches) {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }

  return res.status(401).json({ 
    success: false, 
    error: 'Invalid identifier or password. Please verify your admin database records or use default fallback credentials.' 
  });
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

    // 4. Most active calculator/developer tools (All tools, no LIMIT 10)
    const toolUsage = db.prepare(`
      SELECT details as tool_id, COUNT(*) as count 
      FROM activity_logs 
      WHERE action_type = 'tool_use' 
      GROUP BY details 
      ORDER BY count DESC
    `).all();

    // 5. Retrieve all tool ratings from SQLite
    const toolRatings = db.prepare(`
      SELECT tool_id, rating_sum, rating_count 
      FROM tool_ratings
    `).all();

    // 6. Grid/Timeline parameters (Last 14 active calendar days)
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

    // 7. Recent activity timeline audit log feed
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
      toolRatings,
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

// Explicit dynamic Sitemap generator matching all tools and blog articles
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml; charset=utf-8');
  const rootUrl = "https://tool-hub-app.vercel.app";
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Core pages
  xml += `  <url>\n    <loc>${rootUrl}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  
  // Tools list
  TOOLS.forEach(t => {
    xml += `  <url>\n    <loc>${rootUrl}/#/tools/${t.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // Blogs list
  BLOG_ARTICLES.forEach(a => {
    xml += `  <url>\n    <loc>${rootUrl}/#/blog/${a.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;
  res.send(xml);
});

// Explicit robots.txt endpoint matching crawl directives
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send(`# ToolHub Sitemap & Crawling Directives (all in one click)
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://tool-hub-app.vercel.app/sitemap.xml`);
});

// Setup Vite Dev Server / Static Assets Production Mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } else {
    console.log('🚀 Running in Vercel Serverless environment: skipped app.listen configuration.');
  }
}

startServer().catch(err => {
  console.error('Failed to start full-stack server:', err);
});

export default app;
