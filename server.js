const express = require('express');
const app = express();
const PORT = 3000;

let results = []; // Store results in-memory

app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

app.post('/record', (req, res) => {
    results.push(req.body);
    res.send({ status: "success" });
});

app.get('/results.csv', (req, res) => {
    let csvContent = "Color1,Color2,CorrectAnswer,UserResponse\n";
    results.forEach(row => {
        csvContent += `${row.color1},${row.color2},${row.correctAnswer},${row.userResponse}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvContent);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});