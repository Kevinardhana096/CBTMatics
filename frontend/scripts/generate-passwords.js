const bcrypt = require('bcrypt');

async function generateHashes() {
    const passwords = {
        'admin123': await bcrypt.hash('admin123', 10),
        'teacher123': await bcrypt.hash('teacher123', 10),
        'student123': await bcrypt.hash('student123', 10),
    };

    console.log('Generated Password Hashes:\n');
    console.log('admin123:', passwords['admin123']);
    console.log('teacher123:', passwords['teacher123']);
    console.log('student123:', passwords['student123']);

    console.log('\n\nSQL Update Statement:');
    console.log(`
UPDATE users SET password = '${passwords['admin123']}' WHERE email = 'admin@cbt.com';
UPDATE users SET password = '${passwords['teacher123']}' WHERE email = 'teacher@cbt.com';
UPDATE users SET password = '${passwords['student123']}' WHERE email = 'student@cbt.com';
    `);

    // Test verification
    console.log('\n\nVerification Tests:');
    console.log('admin123 matches:', await bcrypt.compare('admin123', passwords['admin123']));
    console.log('teacher123 matches:', await bcrypt.compare('teacher123', passwords['teacher123']));
    console.log('student123 matches:', await bcrypt.compare('student123', passwords['student123']));
}

generateHashes();
