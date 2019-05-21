const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async (req, res) => {
  // validate data
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // check to see if the user already exists
  const emailExists = await User.findOne({
    email: req.body.email
  });

  if (emailExists) {
    return res.status(400).send('Email already exists');
  }

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // create the user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });

  try {
    const savedUser = await user.save();
    res.send({ savedUser: user._id });
  } catch (err) {
    res.status(404).send(err);
  }
});

router.post('/login', async (req, res) => {
  // validate data
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // check to see if the user already exists
  const user = await User.findOne({
    email: req.body.email
  });

  if (!user) {
    return res.status(400).send('Email is incorrect!');
  }

  // check password
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    return res.status(400).send('Password is not valid');
  }

  // create and assign a token
  const token = jwt.sign(
    {
      _id: user._id
    },
    process.env.TOKEN_SECRET
  );

  res.header('auth-token', token).send(token);
});

module.exports = router;
