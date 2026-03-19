const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Star Wars Characters API',
    description: 'API for managing Star Wars characters organized by faction'
  },
  host: 'localhost:3000'
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];

swaggerAutogen(outputFile, routes, doc);
