console.log('Starting test...');

try {
    require('dotenv').config();
    console.log('dotenv loaded');
    
    const express = require('express');
    console.log('express loaded');
    
    const app = express();
    console.log('express app created');
    
    const PORT = process.env.PORT || 3000;
    console.log('PORT:', PORT);
    
    app.get('/', (req, res) => {
        res.send('Test server is running!');
    });
    
    app.listen(PORT, () => {
        console.log(`Test server running on port ${PORT}`);
    });
    
} catch (error) {
    console.error('Error:', error);
}
