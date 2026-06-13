import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let SQL = null;

export const getDb = () => db;

export const initDatabase = async () => {
  try {
    SQL = await initSqlJs();
    
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
    
    createTables();
    
    console.log('数据库初始化成功');
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

const createTables = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS travels (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      cover_image TEXT,
      status TEXT DEFAULT 'ongoing',
      privacy_level TEXT DEFAULT 'private',
      password TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS travel_companions (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      user_id TEXT,
      name TEXT NOT NULL,
      avatar TEXT,
      role TEXT DEFAULT 'friend',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      name TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      type TEXT DEFAULT 'other',
      check_in_time TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS text_snippets (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      location_id TEXT,
      date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      location_id TEXT,
      taken_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      rating REAL,
      review TEXT,
      latitude REAL,
      longitude REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      type TEXT DEFAULT 'other',
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'CNY',
      date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'attraction',
      description TEXT,
      date TEXT,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS mood_tags (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      tag_name TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0,
      date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      category TEXT DEFAULT 'other',
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'CNY',
      date TEXT,
      payment_method TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      name TEXT NOT NULL,
      distance REAL,
      duration INTEGER,
      start_location TEXT,
      end_location TEXT,
      route_data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS share_links (
      id TEXT PRIMARY KEY,
      travel_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT,
      access_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (travel_id) REFERENCES travels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS anniversaries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      travel_id TEXT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      reminder_days INTEGER DEFAULT 7,
      frequency TEXT DEFAULT 'yearly',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      member_user_id TEXT NOT NULL,
      relationship TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  saveDatabase();
};

export const saveDatabase = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    fs.writeFileSync(dbPath, buffer);
  }
};

export const closeDatabase = () => {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
};
