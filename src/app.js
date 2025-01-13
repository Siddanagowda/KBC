const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Set up Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store game state
const gameStates = new Map();

const prizeMoney = [
    1000, 2000, 3000, 5000, 10000,
    20000, 40000, 80000, 160000, 320000,
    640000, 1250000, 2500000, 5000000, 10000000
];

const topics = [
    'General Knowledge',
    'Science & Technology',
    'History',
    'Geography',
    'Sports',
    'Entertainment',
    'Literature',
    'Current Affairs'
];

async function generateMcq(topic, questionNumber) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Store previously asked questions in the game state
        if (!gameStates.has('askedQuestions')) {
            gameStates.set('askedQuestions', new Set());
        }
        const askedQuestions = gameStates.get('askedQuestions');

        const prompt = `You are creating a question for 'Who Wants to Be a Millionaire' style quiz game.

Topic: ${topic}
Question Number: ${questionNumber}/15 (make it progressively harder)

Rules:
1. Generate ONE challenging multiple-choice question
2. Question should be unique and not about a topic already covered
3. For Sports topic, cover different sports, not just one sport repeatedly
4. Make options distinctly different from each other
5. Ensure question difficulty matches the question number (1=easiest, 15=hardest)
6. Format EXACTLY as shown below:

Example format:
What is the capital of France?
A. London
B. Berlin
C. Paris
D. Madrid
Correct answer: C

Previously asked questions: ${Array.from(askedQuestions).join(', ')}
Do not repeat similar topics or concepts from these questions.`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }]}],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });

        if (!result.response) {
            console.error('No response from Gemini API');
            throw new Error('No response from AI');
        }

        const text = result.response.text().trim();
        console.log('AI Response:', text); // Debug log
        
        // Validate the response format
        const lines = text.split('\n');
        if (lines.length < 6) {
            console.error('Invalid response format (not enough lines):', text);
            throw new Error('Invalid response format from AI');
        }

        // Validate each line
        if (!lines[1].startsWith('A.') || 
            !lines[2].startsWith('B.') || 
            !lines[3].startsWith('C.') || 
            !lines[4].startsWith('D.') || 
            !lines[5].startsWith('Correct answer:')) {
            console.error('Invalid response format (wrong format):', text);
            throw new Error('Invalid response format from AI');
        }

        // Store the question to avoid repetition
        askedQuestions.add(lines[0].trim());
        
        return text;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

app.get('/', (req, res) => {
    res.render('topic-selection', { topics });
});

app.post('/start-game', (req, res) => {
    const { topic } = req.body;
    if (!topics.includes(topic)) {
        return res.status(400).json({ error: 'Invalid topic' });
    }
    
    const sessionId = Math.random().toString(36).substring(7);
    gameStates.set(sessionId, {
        currentQuestion: 1,
        score: 0,
        totalQuestions: 15,
        topic,
        questions: [],
        answers: []
    });
    
    res.redirect(`/play/${sessionId}`);
});

app.get('/play/:sessionId', async (req, res) => {
    const sessionId = req.params.sessionId;
    const gameState = gameStates.get(sessionId);
    
    if (!gameState) {
        return res.redirect('/');
    }
    
    try {
        // Try up to 3 times to generate a valid question
        let mcqs;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                mcqs = await generateMcq(gameState.topic, gameState.currentQuestion);
                break; // If successful, exit the loop
            } catch (error) {
                attempts++;
                console.error(`Attempt ${attempts} failed:`, error);
                if (attempts === maxAttempts) {
                    throw error; // Throw the last error if all attempts fail
                }
                // Wait a short time before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        const lines = mcqs.split('\n');
        
        const question = lines[0].trim();
        const options = [
            lines[1].slice(3).trim(),
            lines[2].slice(3).trim(),
            lines[3].slice(3).trim(),
            lines[4].slice(3).trim()
        ];
        const correctOption = lines[5].split(': ')[1].trim();

        // Store question and correct answer for results
        gameState.questions.push({
            question,
            options,
            correctOption,
            questionNumber: gameState.currentQuestion
        });

        res.render('game', { 
            question, 
            options, 
            correctOption,
            sessionId,
            currentQuestion: gameState.currentQuestion,
            prizeMoney: prizeMoney[gameState.currentQuestion - 1],
            totalQuestions: gameState.totalQuestions,
            topic: gameState.topic
        });
    } catch (error) {
        console.error('Error generating question:', error);
        // Check if it's an API key error
        if (error.message && error.message.includes('API key')) {
            res.render('error', { 
                error: 'There was an issue with the API configuration. Please try again later.',
                sessionId
            });
        } else {
            res.render('error', { 
                error: 'An error occurred while generating the question. Please try again.',
                sessionId
            });
        }
    }
});

app.post('/check-answer', async (req, res) => {
    const { sessionId, selectedAnswer, correctAnswer } = req.body;
    const gameState = gameStates.get(sessionId);

    if (!gameState) {
        return res.status(400).json({ error: 'Invalid session' });
    }

    console.log('Selected Answer:', selectedAnswer);
    console.log('Correct Answer:', correctAnswer);

    // Store user's answer
    gameState.answers.push({
        questionNumber: gameState.currentQuestion,
        selectedAnswer,
        correctAnswer,
        isCorrect: selectedAnswer === correctAnswer
    });

    if (selectedAnswer === correctAnswer) {
        gameState.currentQuestion++;
        gameState.score = prizeMoney[gameState.currentQuestion - 2];

        if (gameState.currentQuestion > gameState.totalQuestions) {
            const results = {
                finalScore: gameState.score,
                topic: gameState.topic,
                questions: gameState.questions,
                answers: gameState.answers
            };
            gameStates.delete(sessionId);
            return res.json({
                correct: true,
                gameComplete: true,
                results
            });
        }

        try {
            const mcqs = await generateMcq(gameState.topic, gameState.currentQuestion);
            const lines = mcqs.split('\n');
            
            const question = lines[0].trim();
            const options = [
                lines[1].slice(3).trim(),
                lines[2].slice(3).trim(),
                lines[3].slice(3).trim(),
                lines[4].slice(3).trim()
            ];
            const correctOption = lines[5].split(': ')[1].trim();

            // Store question and correct answer for results
            gameState.questions.push({
                question,
                options,
                correctOption,
                questionNumber: gameState.currentQuestion
            });

            const nextQuestion = {
                question,
                options,
                correctOption,
                currentQuestion: gameState.currentQuestion,
                prizeMoney: prizeMoney[gameState.currentQuestion - 1]
            };

            return res.json({
                correct: true,
                gameComplete: false,
                nextQuestion
            });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ error: 'Failed to generate next question. Please try again.' });
        }
    } else {
        const results = {
            finalScore: gameState.score,
            topic: gameState.topic,
            questions: gameState.questions,
            answers: gameState.answers
        };
        gameStates.delete(sessionId);
        return res.json({
            correct: false,
            gameComplete: true,
            results
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});