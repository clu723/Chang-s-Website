import express from "express";
import cors from "cors";
import chatbotRoutes from './routes/chatbot.js';

const port = 3000;
const app = express();

app.use(cors());              
app.use(express.json());        
app.use(express.static('public'));
app.use('/api/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html');
});

app.get('/about', (req, res) => {
  res.sendFile(process.cwd() + '/public/about.html');
});

app.get('/projects', (req, res) => {
  res.sendFile(process.cwd() + '/public/projects.html');
});

app.listen(port, () => console.log(`Server started on http://localhost:${port}`));