

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const userRouter = require('./routes/users');

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());


// Routes
app.use('/users', userRouter);

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT);

console.log(`Server listening at ${PORT}`);