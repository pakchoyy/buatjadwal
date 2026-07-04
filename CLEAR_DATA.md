# Cara Clear Data Lama

## Problem
Setelah update seed data, data lama (SMP NEGERI 1 BATUMARMAR) masih muncul.

## Solution

### Option 1: Clear via Browser DevTools
1. Buka aplikasi di browser
2. Press **F12** (DevTools)
3. Tab **Application** (Chrome) atau **Storage** (Firefox)
4. Klik **Local Storage** → pilih domain aplikasi
5. Klik **Clear All** atau delete semua keys
6. **Refresh page** (Ctrl+R atau F5)
7. Click tombol **"Seed Database"** lagi

### Option 2: Clear via Console
1. Press **F12** (DevTools)
2. Tab **Console**
3. Paste command:
   ```javascript
   localStorage.clear(); location.reload();
   ```
4. Press **Enter**
5. Click tombol **"Seed Database"** lagi

### Option 3: Incognito/Private Window
1. Buka **Incognito/Private Window** (Ctrl+Shift+N)
2. Buka aplikasi URL
3. Click tombol **"Seed Database"**
4. Data akan fresh (SDN MBG NUSANTARA)

### Option 4: Hard Refresh
1. **Ctrl+Shift+R** (Chrome/Firefox)
2. Atau **Ctrl+F5**
3. Click tombol **"Seed Database"**

---

## Why This Happens

Aplikasi menggunakan **LocalStorage** untuk simpan data.
Data lama tidak otomatis terhapus saat code update.

## Verification

Setelah clear & seed ulang, check:
- ✅ Nama sekolah: **SDN MBG NUSANTARA**
- ✅ Alamat: **Jl. Raya Mulus Sekali**
- ✅ District: **KABUPATEN JAYA**
- ✅ Email: **mbgjaya@gmail.com**
- ✅ Tahun Ajaran: **2026-2027**
