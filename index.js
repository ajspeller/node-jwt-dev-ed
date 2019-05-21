require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');

app.use(morgan('dev'));

// import routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');

// connect to db
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => {
  console.log(`DB Connetion successful`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/user', authRoute);
app.use('/api/posts', postRoute);

app.listen(3000, () => console.log('Server up an running'));
