import express from "express";
import cors from "cors";
import chatbotRoutes from './routes/gemini.js';

const port = 3000;
const app = express();

app.use(cors());              
app.use(express.json());        
app.use(express.static('public'));
app.use('/api/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/docs/index.html');
});

app.get('/chatbot', (req, res) => {
  res.sendFile(process.cwd() + '/docs/index.html');
});

app.get('/about', (req, res) => {
  res.sendFile(process.cwd() + '/docs/about.html');
});

app.get('/projects', (req, res) => {
  res.sendFile(process.cwd() + '/docs/projects.html');
});

app.listen(port, () => console.log(`Server started on http://localhost:${port}`));