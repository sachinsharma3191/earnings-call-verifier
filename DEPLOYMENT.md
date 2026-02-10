# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Method 1: One-Click Deploy

1. Push code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Click "Deploy"

Done! Your app will be live in ~2 minutes.

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Deploy to Netlify

### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Via Netlify UI

1. Build: `npm run build`
2. Upload `dist/` folder to Netlify
3. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`

---

## Deploy to GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
{
  "scripts": {
    "deploy": "vite build && gh-pages -d dist"
  }
}

# Deploy
npm run deploy
```

Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/your-repo-name/',
  plugins: [react()],
})
```

---

## Deploy to AWS S3 + CloudFront

```bash
# Build
npm run build

# Install AWS CLI
pip install awscli

# Create S3 bucket
aws s3 mb s3://earnings-verifier

# Upload files
aws s3 sync dist/ s3://earnings-verifier --acl public-read

# Configure as static website
aws s3 website s3://earnings-verifier --index-document index.html
```

---

## Deploy with Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Deploy:
```bash
docker build -t earnings-verifier .
docker run -p 80:80 earnings-verifier
```

---

## Environment Configuration

### Production Build

```bash
# Create production build
npm run build

# Test production build locally
npm run preview
```

### Environment Variables

Create `.env.production`:
```env
VITE_APP_TITLE=Earnings Call Verifier
VITE_API_URL=https://api.example.com
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Performance Optimization

### Pre-deployment Checklist

- [ ] Run build: `npm run build`
- [ ] Check bundle size: `npx vite-bundle-visualizer`
- [ ] Test production: `npm run preview`
- [ ] Verify all routes work
- [ ] Check mobile responsiveness
- [ ] Test in different browsers

### Optimization Tips

1. **Enable Compression**
```nginx
# nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

2. **Cache Static Assets**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Enable HTTP/2**
```nginx
listen 443 ssl http2;
```

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS

### CloudFlare (Recommended)
1. Add site to CloudFlare
2. Update nameservers
3. Enable:
   - Auto minify (HTML, CSS, JS)
   - Brotli compression
   - Always use HTTPS
   - HTTP/2

---

## Monitoring

### Vercel Analytics
```bash
npm install @vercel/analytics

# Add to main.jsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### Google Analytics
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Troubleshooting

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
rm -rf node_modules/.vite
```

### Routes Don't Work (404)
Add to `netlify.toml` or `vercel.json`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Slow Build Times
```bash
# Use pnpm instead of npm
npm install -g pnpm
pnpm install
pnpm run build
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: 18
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Security

### Headers

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

**✅ Your app is now deployed and production-ready!**
