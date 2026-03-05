const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'portfolio_secret_key_change_in_production';

// =============================================
// STORAGE SYSTEM
// Local: JSON file | Vercel: JSONBin.io API
// =============================================
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || '';
const JSONBIN_BIN_ID  = process.env.JSONBIN_BIN_ID  || '';
const USE_JSONBIN     = !!(JSONBIN_API_KEY && JSONBIN_BIN_ID);
const DATA_FILE       = path.join(__dirname, 'data/portfolio.json');

let _cache = null;

async function getData() {
  if (USE_JSONBIN) {
    if (_cache) return JSON.parse(JSON.stringify(_cache));
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });
    const json = await res.json();
    _cache = json.record;
    return JSON.parse(JSON.stringify(_cache));
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

async function saveData(data) {
  _cache = data;
  if (USE_JSONBIN) {
    await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
      body: JSON.stringify(data)
    });
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  }
}

// =============================================
// FILE UPLOAD  (disk locally, memory on Vercel)
// =============================================
const USE_DISK = !USE_JSONBIN;
const upload = USE_DISK
  ? multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const d = path.join(__dirname, 'uploads');
          if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
          cb(null, d);
        },
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '-'))
      }),
      limits: { fileSize: 5 * 1024 * 1024 }
    })
  : multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.cookies.admin_token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ========================
// PUBLIC API
// ========================
app.get('/api/portfolio', async (req, res) => {
  try {
    const data = await getData();
    const pub = { ...data };
    if (pub.settings) delete pub.settings.adminPassword;
    res.json(pub);
  } catch(e) { res.status(500).json({ error: 'Load failed' }); }
});

const publicRoutes = { profile:'profile', skills:'skills', projects:'projects',
  achievements:'achievements', experience:'experience', education:'education',
  stats:'stats' };
Object.entries(publicRoutes).forEach(([route, key]) => {
  app.get(`/api/${route}`, async (req, res) => {
    try { res.json((await getData())[key]); } catch(e) { res.status(500).json({ error: e.message }); }
  });
});
app.get('/api/images', async (req, res) => {
  try { res.json((await getData()).images || []); } catch(e) { res.status(500).json({ error: e.message }); }
});

// ========================
// ADMIN AUTH
// ========================
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    const data = await getData();
    const ok = await bcrypt.compare(password, data.settings.adminPassword);
    if (!ok) return res.status(401).json({ error: 'Wrong password!' });
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('admin_token', token, { httpOnly: true, maxAge: 7*24*60*60*1000 });
    res.json({ success: true, token });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/admin/logout', (req, res) => { res.clearCookie('admin_token'); res.json({ success: true }); });
app.get('/api/admin/verify', authMiddleware, (req, res) => res.json({ valid: true }));

// ========================
// ADMIN CRUD
// ========================
app.put('/api/admin/profile', authMiddleware, async (req, res) => {
  try {
    const data = await getData();
    data.profile = { ...data.profile, ...req.body };
    await saveData(data); res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const data = await getData();
    data.stats = { ...data.stats, ...req.body };
    await saveData(data); res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

function makeCrud(section, urlPath) {
  app.post(`/api/admin/${urlPath}`, authMiddleware, async (req, res) => {
    try {
      const data = await getData();
      let item = { ...req.body, id: Date.now() };
      if (section === 'projects' && typeof item.tech === 'string')
        item.tech = item.tech.split(',').map(t => t.trim());
      data[section].push(item);
      await saveData(data); res.json({ success: true, data: item });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  app.put(`/api/admin/${urlPath}/:id`, authMiddleware, async (req, res) => {
    try {
      const data = await getData();
      const idx = data[section].findIndex(x => x.id == req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      const upd = { ...req.body };
      if (section === 'projects' && typeof upd.tech === 'string')
        upd.tech = upd.tech.split(',').map(t => t.trim());
      data[section][idx] = { ...data[section][idx], ...upd };
      await saveData(data); res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  app.delete(`/api/admin/${urlPath}/:id`, authMiddleware, async (req, res) => {
    try {
      const data = await getData();
      data[section] = data[section].filter(x => x.id != req.params.id);
      await saveData(data); res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
}

makeCrud('skills',       'skills');
makeCrud('projects',     'projects');
makeCrud('achievements', 'achievements');
makeCrud('experience',   'experience');
makeCrud('education',    'education');

// ========================
// IMAGE GALLERY
// ========================
app.post('/api/admin/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const data = await getData();
    if (!data.images) data.images = [];

    let url;
    if (USE_DISK) {
      url = `/uploads/${req.file.filename}`;
    } else {
      // Vercel: save as base64 data URL inside JSONBin
      url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const rec = {
      id: Date.now(),
      filename: USE_DISK ? req.file.filename : req.file.originalname,
      originalName: req.file.originalname,
      url,
      size: req.file.size,
      category: req.body.category || 'General',
      caption: req.body.caption || '',
      uploadedAt: new Date().toISOString()
    };
    data.images.push(rec);
    await saveData(data);
    res.json({ success: true, image: rec, url });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/images/:id', authMiddleware, async (req, res) => {
  try {
    const data = await getData();
    if (!data.images) return res.status(404).json({ error: 'Not found' });
    const idx = data.images.findIndex(i => i.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    data.images[idx] = { ...data.images[idx], ...req.body };
    await saveData(data); res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/images/:id', authMiddleware, async (req, res) => {
  try {
    const data = await getData();
    if (!data.images) return res.status(404).json({ error: 'Not found' });
    const img = data.images.find(i => i.id == req.params.id);
    if (!img) return res.status(404).json({ error: 'Not found' });
    if (USE_DISK && img.filename) {
      const fp = path.join(__dirname, 'uploads', img.filename);
      if (fs.existsSync(fp)) try { fs.unlinkSync(fp); } catch(_) {}
    }
    data.images = data.images.filter(i => i.id != req.params.id);
    await saveData(data); res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Change password
app.put('/api/admin/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const data = await getData();
    const ok = await bcrypt.compare(currentPassword, data.settings.adminPassword);
    if (!ok) return res.status(401).json({ error: 'Current password is wrong' });
    data.settings.adminPassword = await bcrypt.hash(newPassword, 10);
    await saveData(data); res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ========================
// PAGE ROUTES
// ========================
app.get('/',            (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/admin',       (req, res) => res.sendFile(path.join(__dirname, 'admin/index.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, 'admin/login.html')));

// Startup password check
async function ensureDefaultPassword() {
  try {
    const data = await getData();
    const looksValid = data.settings?.adminPassword?.startsWith('$2');
    if (!looksValid) {
      data.settings = data.settings || {};
      data.settings.adminPassword = await bcrypt.hash('admin123', 10);
      await saveData(data);
      console.log('✅ Default password set: admin123');
    }
  } catch(e) { console.error('Password check error:', e.message); }
}

if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    await ensureDefaultPassword();
    console.log(`🚀 http://localhost:${PORT}`);
    console.log(`⚙️ Admin: http://localhost:${PORT}/admin/login`);
  });
}

module.exports = app;
