const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { sendContactEmail } = require('../services/contactEmailService');

function validateContact(body) {
  const errors = [];
  if (!body.type || !['email','phone','address','link'].includes(String(body.type))) errors.push('invalid type');
  if (!body.label || String(body.label).trim().length < 2) errors.push('label required');
  if (!body.value || String(body.value).trim().length < 1) errors.push('value required');
  return errors;
}

router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const items = await db.collection('contacts').find({}).sort({ sort_order: 1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const item = await db.collection('contacts').findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateContact(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const db = getDB();
    const doc = {
      type: req.body.type,
      label: req.body.label,
      value: req.body.value,
      icon_url: req.body.icon_url || '',
      sort_order: Number(req.body.sort_order || 0)
    };
    const result = await db.collection('contacts').insertOne(doc);
    const created = await db.collection('contacts').findOne({ id: result.insertedId });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const update = { $set: {
      type: req.body.type,
      label: req.body.label,
      value: req.body.value,
      icon_url: req.body.icon_url || '',
      sort_order: Number(req.body.sort_order || 0)
    } };
    const result = await db.collection('contacts').updateOne({ id: req.params.id }, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await db.collection('contacts').findOne({ id: req.params.id });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('contacts').deleteOne({ id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

// Send a contact form message: store and email to recipient
router.post('/send', async (req, res, next) => {
  try {
    const { name, email, subject, category, message } = req.body || {};
    const errors = [];
    if (!name || String(name).trim().length < 2) errors.push('name');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email))) errors.push('email');
    if (!subject || String(subject).trim().length < 2) errors.push('subject');
    if (!message || String(message).trim().length < 5) errors.push('message');
    if (errors.length) return res.status(400).json({ error: `Invalid fields: ${errors.join(', ')}` });

    const db = getDB();
    let toEmail = process.env.CONTACT_RECIPIENT_EMAIL || process.env.SUPPORT_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
    try {
      const siteInfoDoc = await db.collection('site_settings').findOne({ section: 'site_info' });
      const configured = siteInfoDoc?.config?.contactRecipientEmail;
      if (configured && String(configured).includes('@')) toEmail = configured;
    } catch {}
    if (!toEmail) return res.status(500).json({ error: 'Recipient email is not configured' });

    const now = new Date();
    const record = {
      name: String(name).trim(),
      email: String(email).trim(),
      subject: String(subject).trim(),
      category: String(category || '').trim(),
      message: String(message).trim(),
      status: 'new',
      created_at: now,
      updated_at: now,
    };
    const insert = await db.collection('contact_messages').insertOne(record);
    const msgId = insert.insertedId;

    try {
      const result = await sendContactEmail({ toEmail, fromEmail: email, name, subject, category, message });
      await db.collection('contact_messages').updateOne({ _id: msgId }, { $set: { status: 'sent', email_message_id: result?.messageId } });
    } catch (err) {
      console.error('Failed to send contact email:', err?.message || err);
      await db.collection('contact_messages').updateOne({ _id: msgId }, { $set: { status: 'failed', error: String(err?.message || err) } });
      // do not expose internal mail failure to user
    }

    return res.status(201).json({ message: 'Message received. We will contact you soon.', id: msgId });
  } catch (e) { next(e); }
});

module.exports = router;