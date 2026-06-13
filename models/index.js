import { getDb, saveDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class User {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const passwordHash = await bcrypt.hash(data.password_hash, 10);
    
    db.run(`
      INSERT INTO users (id, username, email, password_hash, avatar, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, data.username, data.email, passwordHash, data.avatar || null, now, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByEmail(email) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([email]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  async comparePassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export class Travel {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO travels (id, user_id, name, description, start_date, end_date, cover_image, status, privacy_level, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, data.user_id, data.name, data.description || null, data.start_date, data.end_date || null, data.cover_image || null, data.status || 'ongoing', data.privacy_level || 'private', data.password || null, now, now]);
    
    saveDatabase();
    
    return Travel.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM travels WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByUserId(userId, options = {}) {
    const db = getDb();
    let query = 'SELECT * FROM travels WHERE user_id = ?';
    const params = [userId];
    
    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }
    
    query += ' ORDER BY start_date DESC';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      if (options.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }
    
    const stmt = db.prepare(query);
    stmt.bind(params);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async countByUserId(userId) {
    const db = getDb();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM travels WHERE user_id = ?');
    stmt.bind([userId]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row.count;
    }
    stmt.free();
    return 0;
  }

  static async update(id, data) {
    const db = getDb();
    const now = new Date().toISOString();
    
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    db.run(`UPDATE travels SET ${fields.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    
    return Travel.findById(id);
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM travels WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class Companion {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO travel_companions (id, travel_id, user_id, name, avatar, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, data.user_id || null, data.name, data.avatar || null, data.role || 'friend', now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM travel_companions WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM travel_companions WHERE travel_id = ?');
    stmt.bind([travelId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM travel_companions WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class Location {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO locations (id, travel_id, name, latitude, longitude, type, check_in_time, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, data.name, data.latitude || null, data.longitude || null, data.type || 'other', data.check_in_time || null, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM locations WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM locations WHERE travel_id = ? ORDER BY check_in_time ASC');
    stmt.bind([travelId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async searchByName(name) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM locations WHERE name LIKE ?');
    stmt.bind([`%${name}%`]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM locations WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class TextSnippet {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO text_snippets (id, travel_id, title, content, location_id, date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, data.title || null, data.content, data.location_id || null, data.date || null, now, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM text_snippets WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM text_snippets WHERE travel_id = ? ORDER BY date DESC, created_at DESC');
    stmt.bind([travelId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async search(query) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM text_snippets WHERE title LIKE ? OR content LIKE ?');
    stmt.bind([`%${query}%`, `%${query}%`]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async update(id, data) {
    const db = getDb();
    const now = new Date().toISOString();
    
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    db.run(`UPDATE text_snippets SET ${fields.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    
    return this.findById(id);
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM text_snippets WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class Photo {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO photos (id, travel_id, url, description, location_id, taken_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, data.url, data.description || null, data.location_id || null, data.taken_at || null, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM photos WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM photos WHERE travel_id = ? ORDER BY taken_at ASC, created_at ASC');
    stmt.bind([travelId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async search(query) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM photos WHERE description LIKE ?');
    stmt.bind([`%${query}%`]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM photos WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class Restaurant {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO restaurants (id, travel_id, name, address, rating, review, latitude, longitude, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, data.name, data.address || null, data.rating || null, data.review || null, data.latitude || null, data.longitude || null, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM restaurants WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM restaurants WHERE travel_id = ? ORDER BY created_at DESC');
    stmt.bind([travelId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM restaurants WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class Ticket {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO tickets (id, travel_id, type, amount, currency, date, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, data.type || 'other', data.amount, data.currency || 'CNY', data.date || null, data.notes || null, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM tickets WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM tickets WHERE travel_id = ? ORDER BY date DESC, created_at DESC');
    stmt.bind([travelId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM tickets WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class Highlight {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO highlights (id, travel_id, title, type, description, date, is_featured, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, data.title, data.type || 'attraction', data.description || null, data.date || null, data.is_featured ? 1 : 0, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM highlights WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId, featuredOnly = false) {
    const db = getDb();
    let query = 'SELECT * FROM highlights WHERE travel_id = ?';
    if (featuredOnly) {
      query += ' AND is_featured = 1';
    }
    query += ' ORDER BY date DESC, created_at DESC';
    
    const stmt = db.prepare(query);
    stmt.bind([travelId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async update(id, data) {
    const db = getDb();
    
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (key === 'is_featured') {
          fields.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    }
    
    values.push(id);
    
    db.run(`UPDATE highlights SET ${fields.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    
    return this.findById(id);
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM highlights WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class MoodTag {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const presetMoods = ['开心', '感动', '疲惫', '兴奋', '平静', '惊讶', '温馨', '浪漫', 'happy', 'touched', 'tired', 'excited', 'peaceful', 'surprised', 'warm', 'romantic'];
    const isCustom = !presetMoods.includes(data.tag_name);
    
    db.run(`
      INSERT INTO mood_tags (id, travel_id, tag_name, is_custom, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, data.tag_name, isCustom ? 1 : 0, data.date || null, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM mood_tags WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM mood_tags WHERE travel_id = ? ORDER BY date DESC, created_at DESC');
    stmt.bind([travelId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM mood_tags WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class Expense {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO expenses (id, travel_id, category, amount, currency, date, payment_method, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, data.category || 'other', data.amount, data.currency || 'CNY', data.date || null, data.payment_method || null, data.notes || null, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM expenses WHERE travel_id = ? ORDER BY date DESC, created_at DESC');
    stmt.bind([travelId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM expenses WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class Route {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO routes (id, travel_id, name, distance, duration, start_location, end_location, route_data, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, data.name, data.distance || null, data.duration || null, data.start_location || null, data.end_location || null, data.route_data || null, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM routes WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM routes WHERE travel_id = ? ORDER BY created_at ASC');
    stmt.bind([travelId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM routes WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class ShareLink {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const token = generateToken(32);
    
    db.run(`
      INSERT INTO share_links (id, travel_id, token, expires_at, access_count, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, data.travel_id, token, data.expires_at || null, 0, 1, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM share_links WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByToken(token) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM share_links WHERE token = ? AND is_active = 1');
    stmt.bind([token]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByTravelId(travelId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM share_links WHERE travel_id = ? AND is_active = 1');
    stmt.bind([travelId]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async incrementAccessCount(id) {
    const db = getDb();
    db.run('UPDATE share_links SET access_count = access_count + 1 WHERE id = ?', [id]);
    saveDatabase();
  }

  static async deactivate(travelId) {
    const db = getDb();
    db.run('UPDATE share_links SET is_active = 0 WHERE travel_id = ?', [travelId]);
    saveDatabase();
  }
}

function generateToken(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export class Anniversary {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO anniversaries (id, user_id, travel_id, name, date, reminder_days, frequency, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, data.user_id, data.travel_id || null, data.name, data.date, data.reminder_days || 7, data.frequency || 'yearly', 1, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM anniversaries WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByUserId(userId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM anniversaries WHERE user_id = ? AND is_active = 1 ORDER BY date ASC');
    stmt.bind([userId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async findUpcoming(userId, days = 30) {
    const db = getDb();
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    
    const stmt = db.prepare(`
      SELECT * FROM anniversaries 
      WHERE user_id = ? AND is_active = 1 AND date >= ? AND date <= ?
      ORDER BY date ASC
    `);
    stmt.bind([userId, now.toISOString().split('T')[0], future.toISOString().split('T')[0]]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async update(id, data) {
    const db = getDb();
    
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    values.push(id);
    
    db.run(`UPDATE anniversaries SET ${fields.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    
    return this.findById(id);
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM anniversaries WHERE id = ?', [id]);
    saveDatabase();
  }
}

export class FamilyMember {
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO family_members (id, user_id, member_user_id, relationship, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, [id, data.user_id, data.member_user_id, data.relationship || null, now]);
    
    saveDatabase();
    
    return this.findById(id);
  }

  static async findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM family_members WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async findByUserId(userId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM family_members WHERE user_id = ?');
    stmt.bind([userId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static async findExisting(userId, memberUserId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM family_members WHERE user_id = ? AND member_user_id = ?');
    stmt.bind([userId, memberUserId]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  static async delete(id) {
    const db = getDb();
    db.run('DELETE FROM family_members WHERE id = ?', [id]);
    saveDatabase();
  }
}
