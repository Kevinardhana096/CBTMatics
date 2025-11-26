// Controller untuk autentikasi (login, register, logout)
// Menggunakan Supabase Client untuk koneksi yang reliable
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Lazy initialization untuk Supabase client
let supabaseInstance = null;
function getSupabase() {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase environment variables:', {
                hasUrl: !!supabaseUrl,
                hasKey: !!supabaseKey
            });
            throw new Error('Supabase configuration missing');
        }
        
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }
    return supabaseInstance;
}

// Register user baru
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validasi input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Cek apakah user sudah ada
        const { data: existingUsers, error: checkError } = await getSupabase()
            .from('users')
            .select('id')
            .or(`email.eq.${email},username.eq.${username}`);

        if (checkError) {
            console.error('Error checking user:', checkError);
            return res.status(500).json({ error: 'Database error' });
        }

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user baru
        const { data: newUser, error: insertError } = await getSupabase()
            .from('users')
            .insert([{
                username,
                email,
                password: hashedPassword,
                role: role || 'student'
            }])
            .select('id, username, email, role')
            .single();

        if (insertError) {
            console.error('Error inserting user:', insertError);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
    } catch (err) {
        console.error('Error in register:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for:', email);

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Cari user berdasarkan email
        const { data: user, error: findError } = await getSupabase()
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (findError || !user) {
            console.log('User not found:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('User found:', user.username);

        // Verifikasi password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            console.log('Invalid password for:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Password valid, generating token...');

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', email);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Logout user (client-side akan hapus token)
exports.logout = (req, res) => {
    res.json({ message: 'Logout successful' });
};

// Get current user info
exports.getCurrentUser = async (req, res) => {
    try {
        const { data: user, error } = await getSupabase()
            .from('users')
            .select('id, username, email, role, created_at')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        console.error('Error in getCurrentUser:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
