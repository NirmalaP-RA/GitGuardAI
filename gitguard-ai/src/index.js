require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const { handlePullRequest } = require('../src/orchestrator');
const Reviews = require('./models/Reviews');

const app = express();
app.use(express.json());
app.use(cors());

// Webhook Security Validation
const verifySignature = (req) => {
    const signature = req.headers['x-hub-signature-256'];
    const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    return signature === digest;
};

// API for Dashboard
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error("DETAILED API ERROR:", err); // Look for this in your Node terminal!
        res.status(500).json({ error: err.message });
    }
});

// GitHub Webhook Endpoint
app.post('/webhook', async (req, res) => {
    if (!verifySignature(req)) {
        return res.status(401).send('Invalid Signature');
    }

    const event = req.headers['x-github-event'];
    const payload = req.body;

    if (event === 'pull_request' && (payload.action === 'opened' || payload.action === 'synchronize')) {
        console.log(`Analyzing PR: ${payload.pull_request.title}`);
        handlePullRequest(payload); // Background execution
    }

    res.status(200).send('Event Received');
});

app.listen(process.env.PORT, () => {
    console.log(`GitGuard Sentinel Active on Port ${process.env.PORT}`);
});