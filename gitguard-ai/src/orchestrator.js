const { getDiff } = require('./githubService');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { postComment } = require('./githubService');
const Review = require('./models/Review'); // Import the model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function handlePullRequest(payload) {
    const repo = payload.repository.full_name;
    const prNumber = payload.number;

    // 1. Fetch the Diff 
    const diffData = await getDiff(repo, prNumber);

    // 2. Prepare the AI (Gemini 1.5 Flash) [cite: 33, 114]
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
        You are GitGuard AI, a senior security engineer. 
        Analyze the following code diff for bugs, security flaws, or performance issues.
        
        Rules:
        - Suggest actual, corrected code blocks in Markdown.
        - If no bugs are found, do not comment.
        - Focus only on the changes provided. [cite: 111, 112]

        DIFF:
        ${diffData}
    `;

    // 3. Generate Analysis [cite: 38]
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // 4. Post Feedback back to GitHub [cite: 112, 114]
    if (responseText) {
        // await postComment(repo, prNumber, responseText);
        await Review.create({
    repoName: repo,
    prNumber: prNumber,
    analysis: responseText
});
    }

}

module.exports = { handlePullRequest };