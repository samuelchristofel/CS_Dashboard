# Hosting & Server Requirements: Vastel Helpdesk Application

---

## Deployment Options

### Option 1: Free Tier (Recommended for Development)
| Service | Provider | Cost |
|---------|----------|------|
| Web Hosting | Vercel Free Plan | Rp 0/bln |
| Database | PlanetScale Free / Railway Free | Rp 0/bln |
| **Total** | | **Rp 0/bln** |

---

### Option 2: Production Hosting (Hostinger)
| Service | Specification | Cost |
|---------|---------------|------|
| Web Hosting | Hostinger + Free Domain | Rp 119.900/bln |
| VPS (KVM 1) | 1 vCPU, 4 GB RAM, 50 GB NVMe, 4 TB bandwidth | Rp 77.900/bln (promo) |
| **Total** | | **Rp 197.800/bln** |

> Note: VPS renewal cost is Rp 193.900/bln after promo ends.

---

## VPS Specifications (Hostinger KVM 1)

| Component | Specification |
|-----------|---------------|
| CPU | 1 vCPU core |
| RAM | 4 GB |
| Storage | 50 GB NVMe |
| Bandwidth | 4 TB |

---

## What Runs Where

| Component | Free Option | Paid Option |
|-----------|-------------|-------------|
| Next.js App | Vercel | Hostinger / VPS |
| MySQL Database | PlanetScale / Railway | VPS |
| Domain | Vercel subdomain | Hostinger (free with hosting) |
