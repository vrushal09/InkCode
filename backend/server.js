const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',  // React dev server
        'http://localhost:5173',  // Vite dev server
        'https://inkcode-ymp9.onrender.com',  // Backend URL
        'https://inkcode.vercel.app',  // Assuming your Vercel frontend domain
        'https://inkcode-frontend.vercel.app',  // Another possible Vercel domain
        // Add any other frontend URLs that might connect to this backend
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// JDoodle configuration
const JDOODLE_CONFIG = {
    endpoint: 'https://api.jdoodle.com/v1/execute',
    clientId: process.env.JDOODLE_CLIENT_ID || '42f9c097d058e2448f77d3f046e0a836',
    clientSecret: process.env.JDOODLE_CLIENT_SECRET || 'f13ec722771d5dece53756d8cce5f40c299cd09205f2dbe1a6bc6bbfeffbe30f'
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'InkCode Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Code execution endpoint
app.post('/api/execute', async (req, res) => {
    try {
        const { code, language, versionIndex, stdin = '' } = req.body;

        // Validate required fields
        if (!code || !language) {
            return res.status(400).json({
                error: 'Missing required fields: code and language'
            });
        }

        // Prepare JDoodle request
        const jdoodleRequest = {
            clientId: JDOODLE_CONFIG.clientId,
            clientSecret: JDOODLE_CONFIG.clientSecret,
            script: code,
            language: language,
            versionIndex: versionIndex || '0',
            stdin: stdin
        };

        // Make request to JDoodle API
        const response = await axios.post(JDOODLE_CONFIG.endpoint, jdoodleRequest, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });

        // Return JDoodle response
        res.json(response.data);

    } catch (error) {
        console.error('JDoodle API Error:', error.message);
        
        if (error.response) {
            // JDoodle API returned an error
            res.status(error.response.status).json({
                error: 'JDoodle API Error',
                message: error.response.data?.error || error.message,
                details: error.response.data
            });
        } else if (error.code === 'ECONNABORTED') {
            // Timeout error
            res.status(408).json({
                error: 'Execution Timeout',
                message: 'Code execution took too long'
            });
        } else {
            // Network or other error
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
});

// Get supported languages endpoint
app.get('/api/languages', (req, res) => {
    const supportedLanguages = {
        javascript: { name: 'JavaScript', jdoodleLanguage: 'nodejs', versionIndex: '4' },
        python: { name: 'Python', jdoodleLanguage: 'python3', versionIndex: '4' },
        cpp: { name: 'C++', jdoodleLanguage: 'cpp17', versionIndex: '1' },
        c: { name: 'C', jdoodleLanguage: 'c', versionIndex: '5' },
        java: { name: 'Java', jdoodleLanguage: 'java', versionIndex: '4' },
        php: { name: 'PHP', jdoodleLanguage: 'php', versionIndex: '4' },
        ruby: { name: 'Ruby', jdoodleLanguage: 'ruby', versionIndex: '4' },
        go: { name: 'Go', jdoodleLanguage: 'go', versionIndex: '4' },
        rust: { name: 'Rust', jdoodleLanguage: 'rust', versionIndex: '4' },
        kotlin: { name: 'Kotlin', jdoodleLanguage: 'kotlin', versionIndex: '4' },
        swift: { name: 'Swift', jdoodleLanguage: 'swift', versionIndex: '4' }
    };
    
    res.json(supportedLanguages);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on the server'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint was not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 InkCode Backend running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔧 Code execution: http://localhost:${PORT}/api/execute`);
});

module.exports = app;
