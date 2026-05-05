const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const mongoose = require('mongoose');
const { handlePullRequest } = require('../src/orchestrator');
const Reviews = require('../src/models/Reviews');

const app = express();

// IMPORTANT: Increase payload limit for large GitHub diffs
app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// Webhook Security Validation
const verifySignature = (req) => {
    const signature = req.headers['x-hub-signature-256'];
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    
    if (!signature || !secret) return false;

    const hmac = crypto.createHmac('sha256', secret);
    // Use raw string if possible, but JSON.stringify is standard for most setups
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

// API for Dashboard
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Reviews.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error("DETAILED API ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// GitHub Webhook Endpoint
app.post('/webhook', async (req, res) => {
    try {
        // 1. Verify Secret
        if (!verifySignature(req)) {
            console.error("❌ Webhook Signature Mismatch!");
            return res.status(401).send('Invalid Signature');
        }

        const event = req.headers['x-github-event'];
        const payload = req.body;

        // 2. Handle Logic
        if (event === 'pull_request' && (payload.action === 'opened' || payload.action === 'synchronize')) {
            console.log(`🔍 Analyzing PR: ${payload.pull_request.title}`);
            
            // CRITICAL: We await this to ensure the DB save finishes before sending 200
            // If handlePullRequest is NOT async, remove 'await' but ensure it calls a DB save
            await handlePullRequest(payload); 
            
            console.log(`✅ Successfully processed PR: ${payload.pull_request.number}`);
            return res.status(200).send('Analysis Complete and Saved');
        }

        res.status(200).send('Event ignored (not a relevant PR action)');
    } catch (err) {
        console.error("❌ WEBHOOK PROCESSING ERROR:", err);
        res.status(500).send('Internal Server Error during processing');
    }
});

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    family: 4 // Force IPv4
})
.then(() => {
    console.log('✅ Connected to MongoDB');
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`GitGuard Sentinel Active on Port ${port}`);
    });
})
.catch(err => {
    console.error('❌ DATABASE ERROR:', err.message);
    process.exit(1);
});



