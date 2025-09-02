const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));
app.use(express.json());

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
    });

    ws.send('Hello! Message from server');

    // Mock logs
    setInterval(() => {
        ws.send(JSON.stringify({ type: 'log', message: `[${new Date().toLocaleTimeString()}] Mock API call` }));
    }, 5000);
});

// Chatbot API endpoint
app.post('/api/chatbot', (req, res) => {
    const { message } = req.body;
    let reply = 'I am a simple chatbot. I do not understand this.';

    if (message.toLowerCase().includes('hello')) {
        reply = 'Hello there! How can I help you?';
    } else if (message.toLowerCase().includes('skills')) {
        reply = 'Sourabh is skilled in React, Node.js, AWS, and Kubernetes.';
    } else if (message.toLowerCase().includes('experience')) {
        reply = 'Sourabh has over 12 years of experience in software development.';
    }

    // TODO: Integrate with Hugging Face Gradio for a more advanced chatbot
    res.json({ reply });
});

server.listen(8080, () => {
    console.log('Server started on port 8080');
});