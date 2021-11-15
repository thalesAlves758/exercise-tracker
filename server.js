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
  .get(async (req, res) => {
    try {
      const users = await User.find();
      res.json(users.map(({ username, _id }) => ({ username, _id })));
    } catch (err) {
      res.status(500).json({ error: "Unable to find users" });
    }
  })
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

app.post('/api/users/:_id/exercises', async (req, res) => {
  
  const { _id: idUser } = req.params;
  let user;

  try {
    user = await User.findById(idUser);
  } catch (err) {
    return res.status(500).json({ error: "Unable to find the user with id specified in url params" });
  }

  const { description, duration } = req.body;
  let { date } = req.body;
  date = date ? new Date(date) : new Date();

  user.log.push({ description, duration, date });
  
  try {
    await user.save();

    const lastIndexArray = user.log.length - 1;
    const currentDescription = user.log[lastIndexArray].description;
    const currentDuration = user.log[lastIndexArray].duration;
    const currentDate = user.log[lastIndexArray].date.toDateString();

    res.json({
      _id: user.id,
      username: user.username,
      description: currentDescription,
      duration: currentDuration,
      date: currentDate
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to create the exercise" });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id: idUser } = req.params;
  const { from, to, limit } = req.query;
  let user;

  try {
    user = await User.findById(idUser);
  } catch (err) {
    return res.status(500).json({ error: "Unable to find the user with id specified in url params" });
  }

  let logsUser;

  from && (logsUser = user.log.filter(item => (new Date(item.date) >= new Date(from))));
  to && (logsUser && (
    logsUser = logsUser.filter(item => (new Date(item.date) <= new Date(to)))
  ) || (
    logsUser = user.log.filter(item => (new Date(item.date) <= new Date(to)))
  ));
  !logsUser && (logsUser = user.log);

  if(limit && limit < logsUser.length) logsUser.length = limit;

  const count = logsUser.length;
  logsUser = logsUser.map(item => ({
    description: item.description,
    duration: item.duration,
    date: item.date.toDateString()
  }));

  res.json({ _id: user.id, username: user.username, count, log: logsUser });
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port);
    })
  })
  .catch(err => console.error(err));
