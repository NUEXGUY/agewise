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

// Function to send messages
async function handleChatMessage(req, res) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `` },
      ],
    });

    const aiResponse = completion.choices[0].message.content;
    res.json({ message: aiResponse });
  } catch (error) {
    console.error("Error communicating with OpenAI:", error);
    res.status(500).json({ message: "Failed to fetch response from OpenAI", error: error.message });
  }
}

// Route Handler
app.post('/chat-message', handleChatMessage);

// const prompt = "Share a simple greeting to get someone who is living with chronic pain to open up. Something like 'Feel free to ask me any question about your pain or discomfort. What's been bothering you lately?' without including any extra information, context, or lead in";
