import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database.js';

const router = Router();

// GET /api/outreach?contact_id=xxx
router.get('/', (req, res) => {
  const db = getDb();
  const { contact_id } = req.query;

  let query = `
    SELECT ol.*, c.name as contact_name, c.trigger_id
    FROM outreach_log ol
    JOIN contacts c ON c.id = ol.contact_id
  `;
  const params = [];
  if (contact_id) { query += ' WHERE ol.contact_id = ?'; params.push(contact_id); }
  query += ' ORDER BY ol.sent_at DESC';

  res.json(db.prepare(query).all(...params));
});

// POST /api/outreach
router.post('/', (req, res) => {
  const db = getDb();
  const { contact_id, channel, message_content } = req.body;

  if (!contact_id || !channel) {
    return res.status(400).json({ error: 'contact_id and channel are required' });
  }

  const contact = db.prepare('SELECT id FROM contacts WHERE id = ?').get(contact_id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO outreach_log (id, contact_id, channel, message_content)
    VALUES (?, ?, ?, ?)
  `).run(id, contact_id, channel, message_content || null);

  res.status(201).json(db.prepare('SELECT * FROM outreach_log WHERE id = ?').get(id));
});

// PATCH /api/outreach/:id
router.patch('/:id', (req, res) => {
  const db = getDb();
  const entry = db.prepare('SELECT * FROM outreach_log WHERE id = ?').get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Outreach entry not found' });

  const { response_status } = req.body;
  if (!response_status) return res.status(400).json({ error: 'response_status is required' });

  db.prepare('UPDATE outreach_log SET response_status = ? WHERE id = ?').run(response_status, req.params.id);
  res.json(db.prepare('SELECT * FROM outreach_log WHERE id = ?').get(req.params.id));
});

// DELETE /api/outreach/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM outreach_log WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
