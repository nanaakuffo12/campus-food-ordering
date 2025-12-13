const express = require('express');
const { authMiddleware } = require('../middleware/auth');

// In-memory users database (shared with auth routes)
let users = [];

const usersRoutes = () => {
    const router = express.Router();
    
    // Get user profile
    router.get('/profile', authMiddleware, (req, res) => {
        try {
            // In a real app, fetch from database
            // For now, return user from token
            res.json({
                success: true,
                data: {
                    id: req.user.id,
                    email: req.user.email,
                    role: req.user.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Update user profile
    router.put('/profile', authMiddleware, (req, res) => {
        try {
            const { name, roomNumber, phone } = req.body;
            
            // In a real app, update in database
            const updatedProfile = {
                id: req.user.id,
                email: req.user.email,
                name: name || '',
                roomNumber: roomNumber || '',
                phone: phone || '',
                role: req.user.role
            };
            
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedProfile
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    return router;
};

module.exports = { usersRoutes };
