if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: 'environment.env' })
}
const mysql = require('mysql2/promise')
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

const express = require('express')
const app = express()

app.use(express.json())

// Start the server
const port = process.env.PORT || 3000
app.listen(port, '0.0.0.0', () => {
})

app.post('/submit-user-info', async (req, res) => {
  const { name, age, gender, email, phone, contactTime } = req.body

  // Process the input to handle empty strings for age, gender, and contactTime
  const processedAge = age !== '' ? parseInt(age, 10) : null
  const processedGender = gender !== '' ? gender : null
  const processedContactTime = contactTime !== '' ? contactTime : null

  try {
    const query = 'INSERT INTO users (name, age, gender, email, phone, contactTime) VALUES (?, ?, ?, ?, ?, ?)'
    const values = [name, processedAge, processedGender, email, phone, processedContactTime]

    // Use the pool to execute your query
    const [result] = await pool.execute(query, values)

    res.json({ success: true, message: 'User info submitted successfully', result })
  } catch (error) {
    // Check if the error is due to a duplicate entry
    if (error.code === 'ER_DUP_ENTRY' || error.sqlState === '23000') {
      // Treat duplicate entry as a success for the user's perspective
      console.log('Duplicate user info submission, treating as successful:', error)
      res.json({ success: true, message: 'User info already submitted', result: {} })
    } else {
      // Handle other errors normally
      console.error('Error inserting user info into database:', error)
      res.status(500).json({ success: false, message: 'Error submitting user info', error: error.message })
    }
  }
})

// Set up a route to serve the HTML content with the injected variables
app.get('/', (req, res) => {
  const gtag = process.env.GTAG

  const bodyContent = `
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtag}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
  `

  const injectedScripts = `
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtag}');</script>
    <!-- End Google Tag Manager -->
  `

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AgeWise - Chronic Pain Guide</title>
      <link rel="stylesheet" href="style.css">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Roboto+Condensed:wght@800&display=swap" rel="stylesheet">
      <link rel="icon" href="favicon.svg" type="image/svg+xml">
      ${injectedScripts}
    </head>
    <body>
      ${bodyContent}
    </body>
    </html>
  `

  res.send(htmlContent)
})

const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function handleChatMessage (req, res) {
  // Prepare context and user message
  const context = 'As an expert in the field of physical therapy, respond to the following message through the lens of a physical therapist. Be simple, clear, and concise in your resonses, and make them easy to read and take action on. Always end your response with a followup question relevant to their situation.'
  const userMessage = req.body.message

  const requestBody = {
    messages: [
      {
        role: 'system',
        content: context
      },
      {
        role: 'user',
        content: userMessage
      }
    ],
    model: 'gpt-3.5-turbo-0125',
    n: 1
  }

  try {
    const completion = await openai.chat.completions.create(requestBody)

    const aiResponse = completion.choices[0].message.content

    res.json({ message: aiResponse })
  } catch (error) {
    if (error.response && error.response.data) {
      if (error.response.data.error.code === 'rate_limit_reached') {
        res.status(503).json({ message: "I'm getting too many requests right now. Please try again in a few minutes." })
      } else if (error.response.data.error.code === 'model_unavailable') {
        res.status(503).json({ message: 'The requested model is unavailable currently. Please try another model or come back later.' })
      } else {
        console.error('Error communicating with OpenAI:', error)
        res.status(500).json({ message: 'Something went wrong. Please try again later.' })
      }
    } else {
      console.error('Error communicating with OpenAI:', error)
      res.status(500).json({ message: 'Something went wrong. Please try again later.' })
    }
  }
}

// Route Handler
app.post('/chat-message', handleChatMessage)
