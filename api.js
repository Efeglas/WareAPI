const bodyParser = require('body-parser');
const express = require('express');

const userRoutes = require('./routes/user-routes');
const orderRoutes = require('./routes/order-routes');
const tokenRoutes = require('./routes/token-routes');
const infoRoutes = require('./routes/info-routes');
const roleRoutes = require('./routes/role-routes');
const layoutRoutes = require('./routes/layout-routes');
const itemRoutes = require('./routes/item-routes');
const inventoryRoutes = require('./routes/inventory-routes');
const statRoutes = require('./routes/stat-routes');

const app = express();
console.log(new Date());

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/user', userRoutes);
app.use('/order', orderRoutes);
app.use('/token', tokenRoutes);
app.use('/info', infoRoutes);
app.use('/role', roleRoutes);
app.use('/layout', layoutRoutes);
app.use('/item', itemRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/stat', statRoutes);

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong.';
  res.status(status).json({ message: message });
});

app.listen(8080, () =>{
  console.log(`WareAPI is listening on port 8080`);
});