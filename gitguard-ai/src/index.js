require('dotenv').config();
const express = require('express');
const { handlePullRequest } = require('./orchestrator');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors()); 


// GitHub Webhook Endpoint [cite: 106, 114]
app.post('/webhook', async (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    if (event === 'pull_request' && payload.action === 'opened') {
        console.log(`New PR detected: ${payload.pull_request.title}`);
        // Trigger the AI Reviewer flow
        handlePullRequest(payload);
    }

    res.status(200).send('Event Received');
});

app.listen(process.env.PORT, () => {
    console.log(`GitGuard AI listening on port ${process.env.PORT}`);
});