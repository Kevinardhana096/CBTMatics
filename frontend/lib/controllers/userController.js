// Controller untuk manajemen user (admin)
// Menggunakan Supabase Client untuk koneksi yang reliable
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Lazy initialization for Supabase client
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

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;

        let query = getSupabase()
            .from('users')
            .select('id, username, email, role, created_at')
            .order('created_at', { ascending: false });

        if (role) {
            query = query.eq('role', role);
        }

        const { data: users, error } = await query;

        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        res.json({ users: users || [] });
    } catch (err) {
        console.error('Error in getAllUsers:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: user, error } = await getSupabase()
            .from('users')
            .select('id, username, email, role, created_at')
            .eq('id', id)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        console.error('Error in getUserById:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validasi input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Cek apakah user sudah ada
        const { data: existingUsers } = await getSupabase()
            .from('users')
            .select('id')
            .or(`email.eq.${email},username.eq.${username}`);

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user baru
        const { data: user, error } = await getSupabase()
            .from('users')
            .insert([{
                username,
                email,
                password: hashedPassword,
                role: role || 'student'
            }])
            .select('id, username, email, role')
            .single();

        if (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        res.status(201).json({
            message: 'User created successfully',
            user
        });
    } catch (err) {
        console.error('Error in createUser:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role, password } = req.body;

        const updateData = {
            username,
            email,
            role,
            updated_at: new Date().toISOString()
        };

        // Update password jika diberikan
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const { data: user, error } = await getSupabase()
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select('id, username, email, role')
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user
        });
    } catch (err) {
        console.error('Error in updateUser:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await getSupabase()
            .from('users')
            .delete()
            .eq('id', id)
            .select('id')
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error in deleteUser:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
