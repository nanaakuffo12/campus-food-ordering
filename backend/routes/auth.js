const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authMiddleware } = require('../middleware/auth');
const config = require('../config');

// In-memory database (replace with real DB in production)
let users = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        password: bcrypt.hashSync('Admin@123', 10),
        roomNumber: '001',
        role: 'admin'
    },
    {
        id: 2,
        name: 'Test Student',
        email: 'student@example.com',
        password: bcrypt.hashSync('Password123', 10),
        roomNumber: '102',
        role: 'student'
    }
];

let nextUserId = 3;

const authRoutes = () => {
    const router = express.Router();
    
    // Login route
    router.post('/login', (req, res) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password required' });
            }
            
            const user = users.find(u => u.email === email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            const passwordMatch = bcrypt.compareSync(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );
            
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    roomNumber: user.roomNumber,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Signup route
    router.post('/signup', (req, res) => {
        try {
            const { name, email, password, roomNumber } = req.body;
            
            if (!name || !email || !password || !roomNumber) {
                return res.status(400).json({ message: 'All fields required' });
            }
            
            if (users.find(u => u.email === email)) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            
            if (password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters' });
            }
            
            const newUser = {
                id: nextUserId++,
                name,
                email,
                password: bcrypt.hashSync(password, 10),
                roomNumber,
                role: 'student'
            };
            
            users.push(newUser);
            
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email, role: newUser.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );
            
            res.status(201).json({
                message: 'Registration successful',
                token,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    roomNumber: newUser.roomNumber,
                    role: newUser.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Logout route
    router.post('/logout', authMiddleware, (req, res) => {
        res.json({ message: 'Logout successful' });
    });
    
    return router;
};

module.exports = { authRoutes };
