import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database.js';

const router = Router();

// GET /api/contacts?trigger_id=xxx
router.get('/', (req, res) => {
  const db = getDb();
  const { trigger_id } = req.query;

  let query = 'SELECT * FROM contacts';
  const params = [];
  if (trigger_id) { query += ' WHERE trigger_id = ?'; params.push(trigger_id); }
  query += ' ORDER BY added_at DESC';

  res.json(db.prepare(query).all(...params));
});

// GET /api/contacts/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
});

// POST /api/contacts
router.post('/', (req, res) => {
  const db = getDb();
  const { trigger_id, name, role, email, phone, linkedin_url } = req.body;

  if (!trigger_id || !name) {
    return res.status(400).json({ error: 'trigger_id and name are required' });
  }

  const trigger = db.prepare('SELECT id FROM triggers WHERE id = ?').get(trigger_id);
  if (!trigger) return res.status(404).json({ error: 'Trigger not found' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO contacts (id, trigger_id, name, role, email, phone, linkedin_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, trigger_id, name, role || null, email || null, phone || null, linkedin_url || null);

  res.status(201).json(db.prepare('SELECT * FROM contacts WHERE id = ?').get(id));
});

// PATCH /api/contacts/:id
router.patch('/:id', (req, res) => {
  const db = getDb();
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  const allowed = ['name', 'role', 'email', 'phone', 'linkedin_url'];
  const updates = Object.keys(req.body)
    .filter(k => allowed.includes(k))
    .map(k => ({ key: k, value: req.body[k] }));

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  const setClause = updates.map(u => `${u.key} = ?`).join(', ');
  db.prepare(`UPDATE contacts SET ${setClause} WHERE id = ?`).run(...updates.map(u => u.value), req.params.id);

  res.json(db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id));
});

// DELETE /api/contacts/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
