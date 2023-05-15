// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Board Game API',
            version: '1.0.0',
            description: 'A simple CRUD API for managing board games',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./index.js'],
};

const specs = swaggerJSDoc(options);

module.exports = specs;
