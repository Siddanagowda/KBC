const express = require('express');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 3000;

// Set up OpenAI API
const configuration = new Configuration({
  apiKey: 'your-actual-api-key',
});
const openai = new OpenAIApi(configuration);

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', async (req, res) => {
  const topic = 'General Knowledge';
  const mcqs = await generateMcq(topic, 1);
  
  if (mcqs.error) {
    return res.send(mcqs.error);
  }

  const lines = mcqs.split('\n');
  if (lines.length < 6) {
    return res.send(`An error occurred: The generated response does not have enough lines. Response: ${mcqs}`);
  }

  const question = lines[0].trim();
  const options = [lines[1].slice(3).trim(), lines[2].slice(3).trim(), lines[3].slice(3).trim(), lines[4].slice(3).trim()];
  const correctOption = lines[5].split(': ')[1].trim();

  res.render('index', { question, options, correctOption });
});

app.post('/api/answer', (req, res) => {
  const { selectedAnswer, correctOption } = req.body;
  const isCorrect = selectedAnswer === correctOption;
  res.json({ result: isCorrect ? 'correct' : 'incorrect' });
});

app.post('/api/restart', (req, res) => {
  res.json({ result: 'restarted' });
});

async function generateMcq(topic, numQuestions) {
  const prompt = `
    Generate ${numQuestions} multiple-choice questions (MCQs) on the topic "${topic}".
    Each question should have 4 options (A, B, C, D) and indicate the correct option.
    Format the response like this:
    
    1. Question text
       A. Option 1
       B. Option 2
       C. Option 3
       D. Option 4
       Correct answer: X
  `;

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    return { error: `An error occurred: ${error.message}` };
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});