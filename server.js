const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const { User } = require('./models/User');

require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.route('/api/users')
  .post(async (req, res) => {
    const { username } = req.body;

    if(!username) return res.status(400).json({ validationError: "A username is required" });

    try {
      const user = await User.create({ username });
      res.json({ username: user.username, _id: user.id });
    } catch (err) {
      res.status(500).json({ error: "Unable to create a user" });
    }
  });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port);
    })
  })
  .catch(err => console.error(err));
