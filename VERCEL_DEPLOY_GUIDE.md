# 🚀 Vercel Pe Deploy Karne Ka Poora Guide

## Total Time: ~15 minutes | Bilkul FREE

---

## STEP 1 — GitHub Account Banao (agar nahi hai)

1. **github.com** pe jao
2. **"Sign up"** click karo
3. Free account banao
4. Email verify karo

---

## STEP 2 — JSONBin Account Banao (Database ke liye)

Vercel pe file save nahi hoti, isliye free online database use karenge.

1. **jsonbin.io** pe jao
2. **"Sign Up"** click karo (free hai)
3. Email se register karo
4. Login karne ke baad dashboard pe jao
5. Left side mein **"API Keys"** click karo
6. **"Create Access Key"** click karo → Name: "portfolio" → Create
7. **Master Key** copy karke kahin save karo (baad mein chahiye hogi)
   - Aisa dikhega: `$2a$10$xxxxxxxxxxxxx`

8. Ab **"Bins"** tab pe jao
9. **"Create Bin"** click karo
10. Ek empty JSON paste karo: `{}`
11. **"Create"** click karo
12. URL mein se **Bin ID** copy karo
    - URL aisa hogi: `https://api.jsonbin.io/v3/b/`**`6507abc123def456`**
    - Woh bold wala part copy karo

---

## STEP 3 — Portfolio.json Ka Data JSONBin Mein Upload Karo

1. JSONBin dashboard pe apna naya bin open karo
2. **"Edit"** click karo
3. `portfolio/data/portfolio.json` file ka poora content copy karo
4. JSONBin mein paste karo
5. **"Save"** click karo

✅ Ab tumhara data cloud mein save hai!

---

## STEP 4 — GitHub Pe Code Upload Karo

### Option A: GitHub Website Se (Easy)

1. **github.com/new** pe jao
2. Repository name: `my-portfolio`
3. **Public** select karo
4. **"Create repository"** click karo
5. "uploading an existing file" link click karo
6. `portfolio` folder ke saare files drag & drop karo
   - `server.js`
   - `package.json`
   - `vercel.json`
   - `README.md`
   - `public/` folder
   - `admin/` folder
   - `data/` folder
7. **"Commit changes"** click karo

### Option B: Git Commands Se (Advanced)

```bash
cd portfolio
git init
git add .
git commit -m "Portfolio website"
git remote add origin https://github.com/TUMHARA_USERNAME/my-portfolio.git
git push -u origin main
```

---

## STEP 5 — Vercel Pe Deploy Karo

1. **vercel.com** pe jao
2. **"Sign Up"** → **"Continue with GitHub"** click karo
3. GitHub se login karo
4. Dashboard pe **"Add New Project"** click karo
5. Apna `my-portfolio` repository dhundho aur **"Import"** click karo
6. Settings page aayega:
   - Framework: **Other** select karo
   - Root Directory: aise hi rehne do
7. **"Environment Variables"** section expand karo
8. Yeh 3 variables add karo:

   | Name | Value |
   |------|-------|
   | `JSONBIN_API_KEY` | (Step 2 mein copy ki Master Key) |
   | `JSONBIN_BIN_ID` | (Step 2 mein copy ki Bin ID) |
   | `JWT_SECRET` | (koi bhi random string, jaise: `meri_portfolio_secret_2024`) |

9. **"Deploy"** click karo
10. 2-3 minute wait karo...

### 🎉 Done! Tumhari site live hai!

Vercel ek URL dega jaise:
`https://my-portfolio-abc123.vercel.app`

---

## STEP 6 — Admin Panel Setup

1. `https://tumhari-site.vercel.app/admin/login` pe jao
2. Password: **`admin123`**
3. Login ke baad **Settings** mein jaake password change karo!
4. Profile, Skills, Projects sab fill karo

---

## ⚠️ Important Notes

### Images ke baare mein:
- Vercel pe images **2MB tak** upload ho sakti hain (JSONBin limit)
- Images base64 format mein save hongi
- Zyada images ke liye Cloudinary free account use karo

### Custom Domain (Optional):
1. Vercel dashboard → tumhara project → **"Domains"**
2. Apna domain add karo (namecheap/godaddy se kharido)
3. DNS settings update karo

### Free Limits:
| Platform | Free Limit |
|----------|-----------|
| Vercel | 100GB bandwidth/month |
| JSONBin | 10,000 requests/month |

---

## 🆘 Agar Koi Error Aaye

### "Module not found" error:
```bash
# package.json mein check karo sab dependencies hain
npm install
```

### "Cannot read data" error:
- JSONBin API Key aur Bin ID dobara check karo
- Environment variables mein spaces nahi hone chahiye

### Site open nahi ho rahi:
- Vercel dashboard → tumhara project → **"Deployments"** → latest deployment → **"View Logs"**
- Error wahan dikhega

---

## 📞 Help Chahiye?

Agar koi step mein problem aaye toh mujhe batao — screenshot share karo, main help kar dunga! 😊
