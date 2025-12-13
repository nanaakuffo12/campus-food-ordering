const express = require('express');
const { authMiddleware } = require('../middleware/auth');

// In-memory orders database
let orders = [
    {
        id: 1,
        userId: 2,
        items: [
            { id: 1, name: 'Jollof Rice', price: 15.00, quantity: 2 }
        ],
        totalPrice: 30.00,
        status: 'Pending',
        createdAt: new Date(),
        estimatedTime: '30 mins'
    }
];

let nextOrderId = 2;

const ordersRoutes = () => {
    const router = express.Router();
    
    // Get all orders (admin) or user's orders
    router.get('/', authMiddleware, (req, res) => {
        try {
            const userOrders = orders.filter(o => o.userId === req.user.id);
            res.json({ success: true, data: userOrders });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Get single order
    router.get('/:id', authMiddleware, (req, res) => {
        try {
            const order = orders.find(o => o.id === parseInt(req.params.id));
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            if (order.userId !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            
            res.json({ success: true, data: order });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Create order
    router.post('/', authMiddleware, (req, res) => {
        try {
            const { items, totalPrice } = req.body;
            
            if (!items || items.length === 0 || !totalPrice) {
                return res.status(400).json({ message: 'Invalid order data' });
            }
            
            const newOrder = {
                id: nextOrderId++,
                userId: req.user.id,
                items,
                totalPrice: parseFloat(totalPrice),
                status: 'Pending',
                createdAt: new Date(),
                estimatedTime: '30 mins'
            };
            
            orders.push(newOrder);
            res.status(201).json({ success: true, data: newOrder });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Update order status (admin only)
    router.put('/:id', authMiddleware, (req, res) => {
        try {
            const order = orders.find(o => o.id === parseInt(req.params.id));
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ message: 'Status required' });
            }
            
            const validStatuses = ['Pending', 'Preparing', 'Ready', 'Completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            
            order.status = status;
            res.json({ success: true, data: order });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    // Cancel order
    router.delete('/:id', authMiddleware, (req, res) => {
        try {
            const index = orders.findIndex(o => o.id === parseInt(req.params.id));
            if (index === -1) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            const order = orders[index];
            if (order.userId !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            
            if (order.status !== 'Pending') {
                return res.status(400).json({ message: 'Can only cancel pending orders' });
            }
            
            const deleted = orders.splice(index, 1);
            res.json({ success: true, message: 'Order cancelled', data: deleted[0] });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
    
    return router;
};

module.exports = { ordersRoutes };
