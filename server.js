require('dotenv').config({ path: '~/environment.env' });
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json());

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post('/submit-user-info', async (req, res) => {
  console.log("Received data:", req.body);
  const { name, age, gender, email, phone, contactTime } = req.body;

  // Process the input to handle empty strings for age, gender, and contactTime
  const processedAge = age !== '' ? parseInt(age, 10) : null;
  const processedGender = gender !== '' ? gender : null;
  const processedContactTime = contactTime !== '' ? contactTime : null;

  try {
    const query = 'INSERT INTO users (name, age, gender, email, phone, contactTime) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [name, processedAge, processedGender, email, phone, processedContactTime];

    // Use the pool to execute your query
    const [result] = await pool.execute(query, values);
    
    // No need to close connection here, as the pool manages connections automatically
    res.json({ success: true, message: 'User info submitted successfully', result });
  } catch (error) {
    console.error('Error inserting user info into database:', error);
    res.status(500).json({ success: false, message: 'Error submitting user info', error: error.message });
  }
});

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handleChatMessage(req, res) {
  console.log("Sending message:", req.body.message);

  try {
    // Access relevant user information (e.g., name) from database if needed

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: req.body.message,
        },
      ],
      model: "gpt-3.5-turbo-0125",
      n: 1,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log("Extracted AI response:", aiResponse);

    res.json({ message: aiResponse });
  } catch (error) {
    if (error.response && error.response.data) {
      if (error.response.data.error.code === 'rate_limit_reached') {
        res.status(503).json({ message: "I'm getting too many requests right now. Please try again in a few minutes." });
      } else if (error.response.data.error.code === 'model_unavailable') {
        res.status(503).json({ message: "The requested model is unavailable currently. Please try another model or come back later." });
      } else {
        console.error("Error communicating with OpenAI:", error);
        res.status(500).json({ message: "Something went wrong. Please try again later." });
      }
    } else {
      console.error("Error communicating with OpenAI:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  }
}

// Route Handler
console.log("Server listening on port 3001");
app.post('/chat-message', handleChatMessage);

// const prompt = "Share a simple greeting to get someone who is living with chronic pain to open up. Something like 'Feel free to ask me any question about your pain or discomfort. What's been bothering you lately?' without including any extra information, context, or lead in";
