# 🚀 Deployment Guide - MAYAR Payment Integration

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
Pastikan semua environment variables sudah di-set di Vercel Dashboard:

```env
# MAYAR Configuration (Production)
MAYAR_API_KEY=eyJhbGciOiJSUzI1NiIs...
MAYAR_BASE_URL=https://api.mayar.id/hl/v2

# App Configuration
NEXT_PUBLIC_APP_URL=https://buatjadwal.vercel.app
NEXT_PUBLIC_MIN_PAYMENT_AMOUNT=10000

# Convex Configuration
CONVEX_DEPLOYMENT=[your-convex-deployment]
NEXT_PUBLIC_CONVEX_URL=https://[your-deployment].convex.cloud
```

### 2. Convex Production Deployment

```bash
# Login ke Convex
npx convex login

# Deploy ke production
npx convex deploy --prod

# Update .env.local dengan production URLs
```

### 3. Vercel Deployment

```bash
# Push ke GitHub
git add .
git commit -m "feat: add MAYAR payment integration"
git push origin main

# Vercel akan auto-deploy
```

## 📝 Post-Deployment Steps

### Step 1: Register Webhook di MAYAR Dashboard

1. Login ke https://web.mayar.id
2. Buka menu **Integration** → **Webhook**
3. Input Webhook URL:
   ```
   https://buatjadwal.vercel.app/api/webhooks/mayar
   ```
4. Klik **Save**
5. Klik **Test URL** untuk verify

### Step 2: Test Payment Flow

#### Test di Staging (Recommended)
1. Buat API Key baru di https://web.mayar.club (sandbox)
2. Update `MAYAR_API_KEY` dan `MAYAR_BASE_URL` di Vercel env vars:
   ```
   MAYAR_BASE_URL=https://api.mayar.club/hl/v2
   ```
3. Test payment dengan e-wallet testing account
4. Verify webhook receives payment notification
5. Check localStorage persistence

#### Test di Production
1. Switch back to production API key
2. Test dengan real payment (Rp10.000)
3. Verify full flow works

### Step 3: Monitor Logs

```bash
# Check Vercel logs
vercel logs --follow

# Check Convex logs
# Visit Convex dashboard: https://dashboard.convex.dev
```

## 🔍 Testing Checklist

### ✅ Payment Flow
- [ ] User dapat klik Export PDF/Excel
- [ ] Payment modal muncul dengan benar
- [ ] User dapat pilih nominal (10k, 25k, 50k, custom)
- [ ] QRIS code generate dengan benar
- [ ] Countdown timer berfungsi
- [ ] Payment status polling berfungsi
- [ ] Setelah payment success, modal tutup dan download otomatis
- [ ] LocalStorage menyimpan payment status
- [ ] User yang sudah bayar langsung download tanpa modal

### ✅ Webhook
- [ ] Webhook endpoint accessible dari MAYAR
- [ ] Webhook signature verification berfungsi
- [ ] Transaction status update ke Convex
- [ ] Payment matched by amount & timestamp

### ✅ Admin Dashboard
- [ ] Dashboard accessible di `/admin`
- [ ] Stats cards menampilkan data benar
- [ ] Export type distribution chart benar
- [ ] Recent transactions list benar
- [ ] Daily revenue chart benar

### ✅ Edge Cases
- [ ] Payment timeout (30 menit) handled dengan benar
- [ ] Payment cancelled handled dengan benar
- [ ] Network error handled dengan benar
- [ ] Multiple concurrent payments handled
- [ ] Rate limiting berfungsi (5 attempts per hour)

## 🐛 Common Issues & Solutions

### Issue: QRIS tidak generate
**Solution:**
```bash
# Check API key validity
curl -X POST https://api.mayar.id/hl/v2/qr-codes/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000}'
```

### Issue: Webhook tidak menerima notifikasi
**Solution:**
1. Check webhook URL registered di MAYAR dashboard
2. Check Vercel logs untuk incoming requests
3. Test webhook manually:
   ```bash
   curl -X POST https://buatjadwal.vercel.app/api/webhooks/mayar \
     -H "Content-Type: application/json" \
     -d '{"event": "payment.received", "data": {"status": true, "amount": 10000}}'
   ```

### Issue: Payment status tidak update
**Solution:**
1. Check Convex transaction record
2. Check polling mechanism di browser console
3. Manually trigger status check:
   ```javascript
   fetch(`/api/payments/status/${transactionId}`).then(r => r.json()).then(console.log)
   ```

### Issue: LocalStorage tidak persist
**Solution:**
1. Check browser localStorage tidak full
2. Check user tidak dalam incognito mode
3. Check localStorage key: `jadwal_payment_status`

## 📊 Monitoring & Analytics

### Metrics to Monitor
1. **Conversion Rate**: % users yang complete payment
2. **Average Donation**: Rata-rata nominal donasi
3. **Export Type Distribution**: Tipe export paling populer
4. **Payment Success Rate**: % payment yang berhasil vs failed

### Convex Dashboard
Visit: https://dashboard.convex.dev
- Monitor transaction table
- Monitor analytics table
- Check function logs

### Vercel Dashboard
Visit: https://vercel.com/dashboard
- Monitor API route performance
- Check error logs
- Monitor bandwidth usage

## 🔐 Security Checklist

- [x] API Key tidak exposed di frontend
- [x] Webhook signature verification implemented
- [x] Rate limiting implemented (5 attempts/hour per IP)
- [x] Amount validation (min 10k, max 1M, kelipatan 1000)
- [x] Transaction expiry (30 minutes)
- [x] No sensitive data in localStorage

## 📞 Support & Troubleshooting

### MAYAR Support
- Email: support@mayar.id
- Telegram: https://t.me/mcngroup
- Docs: https://docs.mayar.id

### Convex Support
- Discord: https://convex.dev/community
- Email: support@convex.dev

### Project Maintainer
- Email: choiruddin2410@gmail.com

## 🎉 Success Indicators

✅ Deployment successful when:
1. Build passes without errors
2. Payment flow works end-to-end
3. Webhook receives notifications
4. Admin dashboard shows data
5. LocalStorage persists payment status
6. User can download after payment

---

**Last Updated:** January 2025
**Version:** 1.0.0
