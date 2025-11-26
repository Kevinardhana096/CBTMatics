const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase Connection via API Client...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env.local');
        console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
        console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
        process.exit(1);
    }

    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Role Key:', supabaseKey.substring(0, 30) + '...\n');

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Test 1: Check users table
        console.log('1️⃣ Testing users table...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, username, email, role')
            .limit(5);

        if (usersError) {
            console.error('❌ Error:', usersError.message);
            console.error('Details:', usersError);
        } else {
            console.log('✅ Users found:', users.length);
            users.forEach(user => {
                console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
            });
        }

        // Test 2: Count questions
        console.log('\n2️⃣ Testing questions table...');
        const { count: questionCount, error: questionsError } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true });

        if (questionsError) {
            console.error('❌ Error:', questionsError.message);
        } else {
            console.log('✅ Total questions:', questionCount);
        }

        // Test 3: Count exams
        console.log('\n3️⃣ Testing exams table...');
        const { count: examCount, error: examsError } = await supabase
            .from('exams')
            .select('*', { count: 'exact', head: true });

        if (examsError) {
            console.error('❌ Error:', examsError.message);
        } else {
            console.log('✅ Total exams:', examCount);
        }

        // Test 4: Get recent exam
        console.log('\n4️⃣ Testing get recent exam...');
        const { data: exams, error: examError } = await supabase
            .from('exams')
            .select('id, title, description, duration')
            .limit(1);

        if (examError) {
            console.error('❌ Error:', examError.message);
        } else if (exams && exams.length > 0) {
            console.log('✅ Recent exam:', exams[0].title);
            console.log('   Duration:', exams[0].duration, 'minutes');
        } else {
            console.log('ℹ️  No exams found');
        }

        // Test 5: Check password hash format
        console.log('\n5️⃣ Checking password hash format...');
        const { data: userWithPwd, error: pwdError } = await supabase
            .from('users')
            .select('email, password')
            .eq('email', 'admin@cbt.com')
            .single();

        if (pwdError) {
            console.error('❌ Error:', pwdError.message);
        } else if (userWithPwd) {
            const hashPrefix = userWithPwd.password.substring(0, 7);
            const hashLength = userWithPwd.password.length;
            console.log('✅ Admin user found');
            console.log('   Email:', userWithPwd.email);
            console.log('   Hash prefix:', hashPrefix, hashPrefix === '$2b$10$' ? '✓ Valid bcrypt' : '✗ Invalid');
            console.log('   Hash length:', hashLength, hashLength === 60 ? '✓ Valid' : '✗ Should be 60');
        }

        console.log('\n✨ Supabase connection test completed!\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testSupabaseConnection();
