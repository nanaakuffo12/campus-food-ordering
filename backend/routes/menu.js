const express = require('express');
const { authMiddleware } = require('../middleware/auth');

// In-memory menu database
let menuItems = [
    { id: 1, name: 'Jollof Rice', description: 'Delicious spiced rice', price: 15.00, category: 'Rice' },
    { id: 2, name: 'Fufu', description: 'Pounded cassava and plantain', price: 12.00, category: 'Fufu' },
    { id: 3, name: 'Waakye', description: 'Rice and beans with sauce', price: 10.00, category: 'Rice' },
    { id: 4, name: 'Kebab', description: 'Grilled meat skewers', price: 18.00, category: 'Meat' },
    { id: 5, name: 'Fried Rice', description: 'Spicy fried rice with vegetables', price: 14.00, category: 'Rice' },
];

let nextMenuId = 6;

const menuRoutes = () => {
    const router = express.Router();
    
    // Get all menu items
    router.get('/', (req, res) => {
        try {
            res.json({ success: true, data: menuItems });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Get single menu item
    router.get('/:id', (req, res) => {
        try {
            const item = menuItems.find(m => m.id === parseInt(req.params.id));
            if (!item) {
                return res.status(404).json({ message: 'Menu item not found' });
            }
            res.json({ success: true, data: item });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Create menu item (admin only)
    router.post('/', authMiddleware, (req, res) => {
        try {
            const { name, description, price, category } = req.body;
            
            if (!name || !price || !category) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            
            const newItem = {
                id: nextMenuId++,
                name,
                description: description || '',
                price: parseFloat(price),
                category
            };
            
            menuItems.push(newItem);
            res.status(201).json({ success: true, data: newItem });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Update menu item (admin only)
    router.put('/:id', authMiddleware, (req, res) => {
        try {
            const item = menuItems.find(m => m.id === parseInt(req.params.id));
            if (!item) {
                return res.status(404).json({ message: 'Menu item not found' });
            }
            
            const { name, description, price, category } = req.body;
            if (name) item.name = name;
            if (description) item.description = description;
            if (price) item.price = parseFloat(price);
            if (category) item.category = category;
            
            res.json({ success: true, data: item });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Delete menu item (admin only)
    router.delete('/:id', authMiddleware, (req, res) => {
        try {
            const index = menuItems.findIndex(m => m.id === parseInt(req.params.id));
            if (index === -1) {
                return res.status(404).json({ message: 'Menu item not found' });
            }
            
            const deleted = menuItems.splice(index, 1);
            res.json({ success: true, message: 'Item deleted', data: deleted[0] });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    return router;
};

module.exports = { menuRoutes };
