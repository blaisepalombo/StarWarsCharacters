const express = require('express');
const mongodb = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use('/', require('./routes'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log('Server running');
    console.log(`Base URL: ${baseUrl}`);
    console.log(`Swagger Docs: ${baseUrl}/api-docs`);
  });

  mongodb.initDb((err) => {
    if (err) {
      console.log('MongoDB not connected yet');
      console.error(err);
    } else {
      console.log('Connected to MongoDB');
    }
  });
}

module.exports = app;