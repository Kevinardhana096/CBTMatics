// Konfigurasi koneksi database menggunakan Pool
require('dotenv').config();
const { Pool } = require('pg');

// Setup koneksi ke PostgreSQL menggunakan Connection Pool
// Pool lebih efisien untuk aplikasi yang concurrent
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Event listener untuk monitoring koneksi
pool.on('connect', () => {
    console.log('Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;
