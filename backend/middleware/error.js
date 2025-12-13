const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation error', error: err.message });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    res.status(500).json({ message: 'Internal server error', error: err.message });
};

module.exports = { errorHandler };
