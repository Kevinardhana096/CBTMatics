#!/bin/bash

# Quick Migration Script: Supabase → VPS PostgreSQL
# Usage: ./migrate-to-vps.sh YOUR_VPS_IP

set -e

VPS_IP=$1

if [ -z "$VPS_IP" ]; then
    echo "❌ Error: VPS IP required"
    echo "Usage: ./migrate-to-vps.sh YOUR_VPS_IP"
    exit 1
fi

echo "🚀 Starting migration from Supabase to VPS..."
echo "VPS IP: $VPS_IP"
echo ""

# Step 1: Export data from Supabase
echo "1️⃣ Exporting data from Supabase..."
node scripts/export-supabase-data.js

if [ $? -eq 0 ]; then
    echo "✅ Data exported to ./backups/"
else
    echo "❌ Export failed"
    exit 1
fi

# Step 2: Verify VPS PostgreSQL is accessible
echo ""
echo "2️⃣ Testing VPS PostgreSQL connection..."
echo "Testing connection to $VPS_IP:5432..."

if command -v psql &> /dev/null; then
    psql "postgresql://postgres:your_password@$VPS_IP:5432/postgres" -c "SELECT version();" &> /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ VPS PostgreSQL is accessible"
    else
        echo "⚠️  Cannot connect to VPS PostgreSQL"
        echo "   Make sure:"
        echo "   - PostgreSQL is installed and running"
        echo "   - Firewall allows port 5432"
        echo "   - postgresql.conf has: listen_addresses = '*'"
        echo "   - pg_hba.conf allows remote connections"
    fi
else
    echo "⚠️  psql not installed, skipping connection test"
fi

# Step 3: Update .env.production
echo ""
echo "3️⃣ Creating .env.production for VPS..."

cat > .env.production << EOF
# VPS Production Configuration
# Generated: $(date)

# Next.js
NEXT_PUBLIC_API_URL=/api

# PostgreSQL Database on VPS
# Update the password and database name
DATABASE_URL=postgresql://postgres:your_password@${VPS_IP}:5432/cbtmatics

# JWT Secret (keep the same from .env.local)
JWT_SECRET=$(grep JWT_SECRET .env.local | cut -d '=' -f2)

# Node Environment
NODE_ENV=production

# Optional: Remove Supabase keys when fully migrated
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
EOF

echo "✅ Created .env.production"
echo ""
echo "📝 Manual steps remaining:"
echo ""
echo "   1. SSH to VPS: ssh user@$VPS_IP"
echo "   2. Install PostgreSQL 15+"
echo "   3. Create database: createdb cbtmatics"
echo "   4. Import schema: psql cbtmatics < database_schema.sql"
echo "   5. Import data: psql cbtmatics < backups/data-export.sql"
echo "   6. Update password in .env.production"
echo "   7. Copy .env.production to VPS"
echo "   8. Deploy application: npm run build && pm2 start npm --name cbt -- start"
echo ""
echo "✨ Migration prep complete!"
echo ""
echo "📖 For detailed guide, see: VPS_MIGRATION.md"
