const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
app.use(express.static(path.join(__dirname, 'build')));

app.get('/hey', (req, res) => res.send('ho!'));
app.get('/fetchQuestions', (req, res) => {
    axios.get('https://opentdb.com/api.php?amount=5&type=multiple')
    .then(function (response) {
      res.status(200).send(response.data);
    });
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })

app.listen(process.env.PORT || 8080)