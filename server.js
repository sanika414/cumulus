require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const storage = require('./storage');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB per file
});

const clean = (n) => path.basename(String(n || '')).trim();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// List files
app.get('/api/files', wrap(async (req, res) => {
  res.json({ mode: storage.mode, files: await storage.list() });
}));

// Upload one or many files
app.post('/api/upload', upload.array('files', 10), wrap(async (req, res) => {
  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: 'No file selected.' });
  }
  for (const f of req.files) {
    await storage.save(clean(f.originalname), f.buffer, f.mimetype);
  }
  res.json({ uploaded: req.files.length });
}));

app.get('/api/files/:name/download', wrap(async (req, res) => {
  res.json({ url: await storage.downloadUrl(clean(req.params.name)) });
}));

app.put('/api/files/:name', wrap(async (req, res) => {
  const newName = clean(req.body.newName);
  if (!newName) return res.status(400).json({ error: 'Enter a new name.' });
  await storage.rename(clean(req.params.name), newName);
  res.json({ ok: true });
}));

app.delete('/api/files/:name', wrap(async (req, res) => {
  await storage.remove(clean(req.params.name));
  res.json({ ok: true });
}));

app.get('/api/local/:name', (req, res) => {
  if (storage.mode !== 'local') return res.sendStatus(404);
  res.download(path.join(storage.dir, clean(req.params.name)));
});

app.use((err, req, res, next) => {
  console.error(err);
  const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File is larger than 25 MB.' : 'Something went wrong. Please try again.';
  res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 500).json({ error: msg });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Cumulus running on http://localhost:${port} (${storage.mode} storage)`));
