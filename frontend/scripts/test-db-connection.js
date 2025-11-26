const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    console.log('🔍 Testing Supabase Database Connection...\n');
    
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
        console.error('❌ DATABASE_URL not found in .env.local');
        process.exit(1);
    }

    console.log('Connection String:', connectionString?.substring(0, 70) + '...');
    
    const pool = new Pool({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        // Test basic connection
        console.log('\n1️⃣ Testing basic connection...');
        const client = await pool.connect();
        console.log('✅ Connection successful!');
        
        // Test database version
        console.log('\n2️⃣ Checking PostgreSQL version...');
        const versionResult = await client.query('SELECT version();');
        console.log('✅ PostgreSQL Version:', versionResult.rows[0].version.split(',')[0]);
        
        // Test tables exist
        console.log('\n3️⃣ Checking tables...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log('✅ Tables found:', tablesResult.rows.length);
        tablesResult.rows.forEach(row => {
            console.log('   -', row.table_name);
        });
        
        // Test users table
        console.log('\n4️⃣ Checking users...');
        const usersResult = await client.query('SELECT COUNT(*) FROM users;');
        console.log('✅ Total users:', usersResult.rows[0].count);
        
        const usersDetailResult = await client.query(`
            SELECT id, username, email, role, 
                   SUBSTRING(password, 1, 20) || '...' as password_preview
            FROM users 
            ORDER BY id;
        `);
        console.log('📋 Users detail:');
        usersDetailResult.rows.forEach(user => {
            console.log(`   - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
            console.log(`     Password hash: ${user.password_preview}`);
        });
        
        // Test questions table
        console.log('\n5️⃣ Checking questions...');
        const questionsResult = await client.query('SELECT COUNT(*) FROM questions;');
        console.log('✅ Total questions:', questionsResult.rows[0].count);
        
        // Test exams table
        console.log('\n6️⃣ Checking exams...');
        const examsResult = await client.query('SELECT COUNT(*) FROM exams;');
        console.log('✅ Total exams:', examsResult.rows[0].count);
        
        // Test submissions table
        console.log('\n7️⃣ Checking submissions...');
        const submissionsResult = await client.query('SELECT COUNT(*) FROM exam_submissions;');
        console.log('✅ Total submissions:', submissionsResult.rows[0].count);
        
        client.release();
        
        console.log('\n✨ All tests passed! Database is ready.\n');
        
    } catch (error) {
        console.error('\n❌ Connection test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

testConnection();
