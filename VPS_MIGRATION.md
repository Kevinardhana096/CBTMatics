# 🚀 Migrasi dari Supabase ke VPS

## Overview

Aplikasi CBTMatics sudah menggunakan connection string Supabase dengan **direct connection (port 5432)** yang memudahkan migrasi ke VPS.

---

## 📋 Persiapan Migrasi

### Current Setup (Supabase)
```env
DATABASE_URL=postgresql://postgres:8ZSazoFoNC8Du0hU@db.pdccqmwqzzisabbkriqa.supabase.co:5432/postgres
```

### Target Setup (VPS)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@your-vps-ip:5432/cbtmatics
```

**Keuntungan menggunakan port 5432:**
- ✅ Direct PostgreSQL connection (no pooler)
- ✅ Compatible dengan semua VPS
- ✅ Minimal code changes
- ✅ Support long-running connections
- ✅ Full PostgreSQL features

---

## 🔧 Langkah Migrasi ke VPS

### 1. Setup PostgreSQL di VPS

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

#### CentOS/RHEL
```bash
# Install PostgreSQL
sudo dnf install postgresql-server postgresql-contrib -y

# Initialize database
sudo postgresql-setup --initdb

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Konfigurasi PostgreSQL

```bash
# Switch ke user postgres
sudo -u postgres psql

# Buat database
CREATE DATABASE cbtmatics;

# Buat user dengan password
CREATE USER cbtadmin WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cbtmatics TO cbtadmin;

# Exit psql
\q
```

### 3. Allow Remote Connections

#### Edit postgresql.conf
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
# atau: /var/lib/pgsql/data/postgresql.conf
```

Tambahkan/ubah:
```conf
listen_addresses = '*'
port = 5432
max_connections = 100
```

#### Edit pg_hba.conf
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Tambahkan di akhir file:
```conf
# Allow remote connections
host    all             all             0.0.0.0/0               md5
host    all             all             ::/0                    md5
```

#### Restart PostgreSQL
```bash
sudo systemctl restart postgresql
```

#### Open Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 5432/tcp

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

### 4. Export Data dari Supabase

```bash
# Install psql client (jika belum ada)
# Ubuntu/Debian:
sudo apt install postgresql-client

# Mac:
brew install postgresql

# Windows: Download dari PostgreSQL official website
```

#### Export database schema & data
```bash
# Export dari Supabase
pg_dump "postgresql://postgres:8ZSazoFoNC8Du0hU@db.pdccqmwqzzisabbkriqa.supabase.co:5432/postgres" \
  --no-owner --no-acl \
  -f supabase_backup.sql

# Atau export hanya data specific table
pg_dump "postgresql://postgres:8ZSazoFoNC8Du0hU@db.pdccqmwqzzisabbkriqa.supabase.co:5432/postgres" \
  -t users -t questions -t exams -t exam_questions -t exam_submissions -t exam_answers \
  --no-owner --no-acl \
  -f supabase_data_only.sql
```

### 5. Import ke VPS

```bash
# Import schema & data
psql "postgresql://cbtadmin:your_secure_password@your-vps-ip:5432/cbtmatics" \
  -f supabase_backup.sql

# Atau import dari database_schema.sql dulu, baru data
psql "postgresql://cbtadmin:your_secure_password@your-vps-ip:5432/cbtmatics" \
  -f frontend/database_schema.sql

# Verify import
psql "postgresql://cbtadmin:your_secure_password@your-vps-ip:5432/cbtmatics" \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

### 6. Update Environment Variables

#### Local Testing
```bash
# Edit frontend/.env.local
DATABASE_URL=postgresql://cbtadmin:your_secure_password@your-vps-ip:5432/cbtmatics
```

#### Test Connection
```bash
cd frontend
npm run dev

# Test API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cbt.com","password":"admin123"}'
```

### 7. Deploy Application ke VPS

#### Option A: Deploy dengan PM2 (Recommended)

```bash
# Di VPS, install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/Kevinardhana096/CBTMatics.git
cd CBTMatics/frontend

# Install dependencies
npm install

# Build production
npm run build

# Setup environment
nano .env.production
```

`.env.production`:
```env
DATABASE_URL=postgresql://cbtadmin:your_secure_password@localhost:5432/cbtmatics
NEXT_PUBLIC_SUPABASE_URL=http://your-vps-ip:3000
NEXT_PUBLIC_API_URL=/api
JWT_SECRET=your-super-secret-jwt-key-32-chars
NODE_ENV=production
```

```bash
# Start with PM2
pm2 start npm --name "cbtmatics" -- start
pm2 save
pm2 startup

# Monitor
pm2 logs cbtmatics
pm2 monit
```

#### Option B: Deploy dengan Docker

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://cbtadmin:password@postgres:5432/cbtmatics
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=cbtmatics
      - POSTGRES_USER=cbtadmin
      - POSTGRES_PASSWORD=your_secure_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  pgdata:
```

```bash
# Deploy
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 8. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/cbtmatics
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cbtmatics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 Security Best Practices

### 1. Database Security
```bash
# Buat firewall rule untuk PostgreSQL
sudo ufw allow from your-app-server-ip to any port 5432

# Atau block semua kecuali localhost (jika app di VPS yang sama)
sudo ufw deny 5432/tcp
```

### 2. Environment Variables
```bash
# Jangan commit .env ke git
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Set proper file permissions
chmod 600 .env.production
```

### 3. PostgreSQL Tuning
```conf
# /etc/postgresql/14/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### 4. Backup Strategy
```bash
# Daily backup script
sudo nano /usr/local/bin/backup-cbtmatics.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/cbtmatics"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump postgresql://cbtadmin:password@localhost:5432/cbtmatics \
  --no-owner --no-acl \
  -f $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-cbtmatics.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-cbtmatics.sh >> /var/log/cbtmatics-backup.log 2>&1
```

---

## 📊 Monitoring

### Database Monitoring
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 seconds';

-- Database size
SELECT pg_size_pretty(pg_database_size('cbtmatics'));
```

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Check memory
free -h

# Check disk
df -h

# Check CPU
top
```

---

## 🚨 Troubleshooting

### Error: "Connection refused"
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if port is open
sudo netstat -tuln | grep 5432

# Check firewall
sudo ufw status
```

### Error: "Authentication failed"
```sql
-- Reset password
sudo -u postgres psql
ALTER USER cbtadmin WITH PASSWORD 'new_password';
```

### Error: "Too many connections"
```conf
# Increase max_connections
# /etc/postgresql/14/main/postgresql.conf
max_connections = 200

# Restart
sudo systemctl restart postgresql
```

---

## 📈 Performance Comparison

| Metric | Supabase Free | VPS (2GB RAM) | VPS (4GB RAM) |
|--------|---------------|---------------|---------------|
| Database Size | 500MB | Unlimited | Unlimited |
| Connections | 60 pooled | 100+ direct | 200+ direct |
| Latency | 50-200ms | <10ms (local) | <10ms (local) |
| Monthly Cost | $0 | ~$10 | ~$20 |
| Control | Limited | Full | Full |

---

## ✅ Checklist Migrasi

- [ ] PostgreSQL installed & running di VPS
- [ ] Database `cbtmatics` created
- [ ] User `cbtadmin` created with password
- [ ] Remote connections allowed
- [ ] Firewall configured
- [ ] Data exported dari Supabase
- [ ] Data imported ke VPS
- [ ] Environment variables updated
- [ ] Connection tested successfully
- [ ] Application deployed
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Backup script configured
- [ ] Monitoring setup

---

**Ready untuk production di VPS!** 🎉
