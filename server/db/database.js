import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'pharma_bd.db');

let _db;

export function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS triggers (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('ema_approval', 'riziv_decision', 'kce_guideline', 'clinical_trial', 'vacancy_signal')),
      title TEXT NOT NULL,
      description TEXT,
      company TEXT,
      company_be TEXT,
      company_domain TEXT,
      therapeutic_area TEXT,
      urgency TEXT NOT NULL CHECK(urgency IN ('high', 'medium', 'early_signal')),
      source_name TEXT,
      source_url TEXT,
      suggested_roles TEXT DEFAULT '[]',
      detected_at TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'contacted', 'meeting_booked', 'proposal_sent', 'won', 'archived'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      trigger_id TEXT NOT NULL REFERENCES triggers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      phone TEXT,
      linkedin_url TEXT,
      added_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS outreach_log (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      channel TEXT NOT NULL CHECK(channel IN ('linkedin', 'email', 'call')),
      message_content TEXT,
      sent_at TEXT DEFAULT (datetime('now')),
      response_status TEXT DEFAULT 'pending' CHECK(response_status IN ('pending', 'replied', 'no_response', 'meeting_booked'))
    );
  `);
}
