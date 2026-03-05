# 🚀 Portfolio Website - Full Stack with Admin Panel

Ek complete portfolio website jisme **frontend**, **backend**, aur **admin panel** sab kuch hai!

---

## 📁 Project Structure

```
portfolio/
├── server.js          ← Main backend server
├── package.json       ← Dependencies
├── data/
│   └── portfolio.json ← Sab data yahan save hota hai
├── public/
│   └── index.html     ← Portfolio frontend website
├── admin/
│   ├── index.html     ← Admin panel
│   └── login.html     ← Admin login
└── uploads/           ← Uploaded images (auto-create hoga)
```

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Install
```bash
cd portfolio
npm install
```

### Step 2: Start Server
```bash
node server.js
```

### Step 3: Open Browser
- 🌐 **Portfolio:** http://localhost:3000
- ⚙️ **Admin Login:** http://localhost:3000/admin/login

---

## 🔐 Admin Access

| Field    | Value      |
|----------|------------|
| URL      | `/admin/login` |
| Password | `admin123` |

> ⚠️ **Important:** Login ke baad Settings mein jaake password zaroor change karo!

---

## ✏️ Admin Panel Features

Admin panel se yeh sab edit kar sakte ho bina code likhe:

| Section | Kya kar sakte ho |
|---------|-----------------|
| **Profile** | Naam, bio, photo, contact info, social links |
| **Stats** | Projects count, clients, experience, awards |
| **Skills** | Add/edit/delete skills with progress bars |
| **Projects** | Projects manage karo with images and links |
| **Achievements** | Awards aur certificates add karo |
| **Experience** | Work history manage karo |
| **Education** | Degree aur certificates |
| **Settings** | Password change karo |

---

## 🌐 API Endpoints

### Public
- `GET /api/portfolio` - Sab data
- `GET /api/profile` - Profile info
- `GET /api/skills` - Skills list
- `GET /api/projects` - Projects list
- `GET /api/achievements` - Achievements

### Admin (requires token)
- `PUT /api/admin/profile` - Profile update
- `POST /api/admin/skills` - Skill add
- `PUT /api/admin/skills/:id` - Skill edit
- `DELETE /api/admin/skills/:id` - Skill delete
- (Same for projects, achievements, experience, education)
- `POST /api/admin/upload` - Image upload

---

## 🚀 Deploy Options

### Free Hosting (Railway.app)
1. GitHub pe push karo
2. railway.app pe new project banao
3. GitHub repo connect karo
4. Auto deploy ho jaega!

### VPS / Custom Server
```bash
# Install PM2 for always-on
npm install -g pm2
pm2 start server.js --name "portfolio"
pm2 startup
pm2 save
```

---

## 🎨 Customize Karna

### Colors change karna
`public/index.html` mein ye lines find karo:
```css
--primary: #6366f1;  /* Main color */
--accent: #a855f7;   /* Accent color */
```
Apni pasand ka color lagao!

---

Made with ❤️ | Node.js + Vanilla JS
