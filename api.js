const bodyParser = require('body-parser');
const express = require('express');

const userRoutes = require('./routes/user-routes');
const orderRoutes = require('./routes/order-routes');

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/user', userRoutes);
app.use('/order', orderRoutes);

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong.';
  res.status(status).json({ message: message });
});

app.listen(8080, () =>{
  console.log(`WareAPI is listening on port 8080`);
});