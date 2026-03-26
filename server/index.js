import express from 'express';
import cors from 'cors';
import triggersRouter from './routes/triggers.js';
import contactsRouter from './routes/contacts.js';
import outreachRouter from './routes/outreach.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/triggers', triggersRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/outreach', outreachRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Pharma BD Monitor API running on http://localhost:${PORT}`);
});
