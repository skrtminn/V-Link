# 🎉 V-Link Full Deployment Guide - PROJECT SELESAI!

## ✅ STATUS: BACKEND SUDAH LIVE!
- **Backend URL:** https://v-link-backend.onrender.com
- **Status:** ✅ Deployed & Running
- **Last Deploy:** Server running on port 10000

## Prerequisites (Sudah Done)
- ✅ GitHub account logged in VS Code
- ✅ Vercel account (free tier)
- ✅ Render account (free tier)
- ✅ MongoDB Atlas account (free tier)
- ✅ Firebase project (free tier)
- ✅ Cloudinary account (free tier)

## Services Setup (Isi Environment Variables)

### 1. MongoDB Atlas
1. Connection String: `mongodb+srv://username:password@cluster.mongodb.net/vlink`
2. **Env Var:** `MONGODB_URI`

### 2. Firebase
1. Project: "v-link"
2. Config JSON dari Project Settings
3. **Env Var:** `FIREBASE_PROJECT_ID`, dll.

### 3. Cloudinary
1. Cloud name, API Key, API Secret
2. **Env Var:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## 🚀 LANGKAH TERAKHIR: Deploy Frontend ke Vercel (TUTORIAL LENGKAP)

### **STEP 1: BUKA VERCEL & LOGIN**
1. Buka browser → https://vercel.com
2. Klik **"Sign In"** (pojok kanan atas)
3. Pilih **"Continue with GitHub"**
4. Login dengan akun GitHub kamu
5. Authorize Vercel untuk akses repository

### **STEP 2: IMPORT PROJECT**
1. Setelah login, klik **"New Project"** (tombol hijau)
2. Di halaman **"Import Git Repository"**:
   - Cari repository kamu: `skrtminn/V-Link`
   - Klik repository tersebut
   - Klik **"Import"**

### **STEP 3: CONFIGURE PROJECT (BAGIAN PENTING!)**
Setelah import, kamu akan di halaman **"Configure Project"**. Isi semua field seperti ini:

#### **A. Project Name**
- **Default:** `v-link` (biarkan saja atau ubah nama jika mau)

#### **B. Framework Preset**
- **Pilih dari dropdown:** `Next.js`

#### **C. Root Directory (SANGAT PENTING!)**
- **Isi field ini:** `frontend`
- **⚠️ JANGAN KOSONG!** Ini yang sering bikin error build

#### **D. Build & Output Settings**
- **Build Command:** `npm run build` (sudah auto-fill)
- **Output Directory:** `out` (sudah auto-fill)
- **Install Command:** `npm install` (sudah auto-fill)

#### **E. Node.js Version**
- **Pilih:** `18.x` (recommended untuk Next.js)

### **STEP 4: ENVIRONMENT VARIABLES (WAJIB ISI!)**
1. Klik bagian **"Environment Variables"** untuk expand
2. Klik **"Add New"** untuk tambah variable

#### **Variable 1: API URL**
```
Name: NEXT_PUBLIC_API_URL
Value: https://v-link-backend.onrender.com
Environment: Production, Preview, Development (centang semua)
```

#### **Variable 2: Firebase Config**
```
Name: NEXT_PUBLIC_FIREBASE_CONFIG
Value: {"apiKey":"your_api_key","authDomain":"your_project.firebaseapp.com","projectId":"your_project_id","storageBucket":"your_project.appspot.com","messagingSenderId":"123456789","appId":"1:123456789:web:abcdef123456"}
Environment: Production, Preview, Development (centang semua)
```

**🔥 CARA DAPATIN FIREBASE CONFIG:**
1. Buka https://console.firebase.google.com
2. Pilih project "v-link"
3. Klik **"Project Settings"** (gear icon)
4. Tab **"General"**
5. Scroll ke **"Your apps"**
6. Klik **"Web app"** (</> icon)
7. Copy seluruh config object dan paste ke Value di atas

### **STEP 5: DEPLOY!**
1. **Double-check** semua settings sudah benar
2. Klik tombol **"Deploy"** (tombol hijau besar)
3. Tunggu proses:
   - **"Initializing"** (10 detik)
   - **"Building"** (2-3 menit)
   - **"Complete"** ✅

### **STEP 6: DAPATIN URL**
Setelah deploy berhasil, kamu akan dapat:
- **Production URL:** `https://v-link.vercel.app` (atau custom domain)
- **Copy URL** ini untuk test

### **STEP 7: TEST APLIKASI**
1. Buka URL production
2. Test fitur:
   - ✅ Halaman home load
   - ✅ Klik "Login" → redirect ke Google OAuth
   - ✅ Register dengan Gmail
   - ✅ Shorten URL di homepage
   - ✅ Dashboard terbuka setelah login
   - ✅ Bio page: `/yourusername`

---

## **Jika Build GAGAL - TROUBLESHOOTING**

### **Error: "Build Command"**
- **Cek:** Root Directory harus `frontend`
- **Cek:** Environment Variables sudah diisi

### **Error: "Module not found"**
- **Cek:** Dependencies di `frontend/package.json` lengkap
- **Cek:** `npm install` berhasil di local

### **Error: "NEXT_PUBLIC_API_URL is not defined"**
- **Cek:** Environment Variables sudah ditambah
- **Cek:** Environment: Production, Preview, Development semua centang

### **Cara Cek Logs Error:**
1. Di Vercel Dashboard → pilih project
2. Klik tab **"Functions"**
3. Klik **"View Logs"**
4. Cari error message

---

## **FINAL CHECKLIST SEBELUM DEPLOY:**
- [ ] Vercel account sudah login
- [ ] GitHub repository connected
- [ ] **Root Directory:** `frontend` (TIDAK BOLEH KOSONG!)
- [ ] **Framework:** Next.js
- [ ] **NEXT_PUBLIC_API_URL:** `https://v-link-backend.onrender.com`
- [ ] **NEXT_PUBLIC_FIREBASE_CONFIG:** config Firebase yang benar
- [ ] Build Command: `npm run build`
- [ ] Node.js Version: 18.x

## Keep-Alive Setup (Opsional - Anti Sleep)
Buat file `.github/workflows/keep-alive.yml`:
```yaml
name: Keep Alive
on:
  schedule:
    - cron: '*/10 * * * *'
jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping backend
        run: curl https://v-link-backend.onrender.com
      - name: Ping frontend
        run: curl https://v-link.vercel.app
```

## Final URLs
- **Frontend:** https://v-link.vercel.app
- **Backend:** https://v-link-backend.onrender.com
- **GitHub:** https://github.com/skrtminn/V-Link

## Testing Checklist
- [ ] Frontend loads di Vercel
- [ ] Register/Login works
- [ ] Shorten URL works
- [ ] Dashboard shows links
- [ ] Bio page editable
- [ ] Analytics tracking

## Features Ready
- ✅ URL Shortening dengan custom alias
- ✅ Bio Pages (seperti Linktree)
- ✅ Auth Gmail OAuth
- ✅ Dashboard manage links
- ✅ Analytics (clicks, location, device)
- ✅ UI responsive dark/light mode
- ✅ QR Code generation
- ✅ Password protection links
- ✅ Link expiration

**PROJECT V-LINK SELESAI! 🎉**

**Selamat! Kamu sudah berhasil buat dan deploy link shortener website pertama kamu!**
