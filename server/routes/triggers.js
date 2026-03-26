import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database.js';

const router = Router();

// GET /api/triggers
router.get('/', (req, res) => {
  const db = getDb();
  const { type, urgency, status } = req.query;

  let query = 'SELECT * FROM triggers WHERE 1=1';
  const params = [];

  if (type) { query += ' AND type = ?'; params.push(type); }
  if (urgency) { query += ' AND urgency = ?'; params.push(urgency); }
  if (status) { query += ' AND status = ?'; params.push(status); }

  query += ' ORDER BY detected_at DESC';

  const triggers = db.prepare(query).all(...params);
  res.json(triggers.map(parseTrigger));
});

// GET /api/triggers/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const trigger = db.prepare('SELECT * FROM triggers WHERE id = ?').get(req.params.id);
  if (!trigger) return res.status(404).json({ error: 'Trigger not found' });

  const contacts = db.prepare('SELECT * FROM contacts WHERE trigger_id = ? ORDER BY added_at DESC').all(req.params.id);
  res.json({ ...parseTrigger(trigger), contacts });
});

// POST /api/triggers
router.post('/', (req, res) => {
  const db = getDb();
  const id = uuidv4();
  const {
    type, title, description, company, company_be, company_domain,
    therapeutic_area, urgency, source_name, source_url, suggested_roles,
  } = req.body;

  if (!type || !title || !urgency) {
    return res.status(400).json({ error: 'type, title, and urgency are required' });
  }

  db.prepare(`
    INSERT INTO triggers (id, type, title, description, company, company_be, company_domain, therapeutic_area, urgency, source_name, source_url, suggested_roles)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, type, title, description || null, company || null, company_be || null,
    company_domain || null, therapeutic_area || null, urgency,
    source_name || null, source_url || null,
    JSON.stringify(suggested_roles || []),
  );

  const trigger = db.prepare('SELECT * FROM triggers WHERE id = ?').get(id);
  res.status(201).json(parseTrigger(trigger));
});

// PATCH /api/triggers/:id
router.patch('/:id', (req, res) => {
  const db = getDb();
  const trigger = db.prepare('SELECT * FROM triggers WHERE id = ?').get(req.params.id);
  if (!trigger) return res.status(404).json({ error: 'Trigger not found' });

  const allowed = ['status', 'title', 'description', 'company', 'company_be', 'company_domain',
    'therapeutic_area', 'urgency', 'source_name', 'source_url', 'suggested_roles'];

  const updates = Object.keys(req.body)
    .filter(k => allowed.includes(k))
    .map(k => ({ key: k, value: k === 'suggested_roles' ? JSON.stringify(req.body[k]) : req.body[k] }));

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  const setClause = updates.map(u => `${u.key} = ?`).join(', ');
  db.prepare(`UPDATE triggers SET ${setClause} WHERE id = ?`).run(...updates.map(u => u.value), req.params.id);

  const updated = db.prepare('SELECT * FROM triggers WHERE id = ?').get(req.params.id);
  res.json(parseTrigger(updated));
});

// DELETE /api/triggers/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const trigger = db.prepare('SELECT * FROM triggers WHERE id = ?').get(req.params.id);
  if (!trigger) return res.status(404).json({ error: 'Trigger not found' });

  db.prepare('DELETE FROM triggers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

function parseTrigger(t) {
  return {
    ...t,
    suggested_roles: JSON.parse(t.suggested_roles || '[]'),
  };
}

export default router;
