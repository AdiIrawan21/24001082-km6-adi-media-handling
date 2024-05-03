require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
const path = require('path');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger
const swaggerUi = require("swagger-ui-express");
const apiDocumentation = require('./docs/api-docs.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocumentation));
// End Swagger

// handle routes for media
const mediaRoutes = require('./routes/media.routes');
app.use('/api/v1', mediaRoutes);

app.use('/', (req, res) => {
    res.send("Hello, ini challenge chapter 6, silakan akses /api-docs untuk melihat documentation api");
})


// 500 error handler
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        status: false,
        message: err.message,
        data: null
    });
});

// 404 error handler
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        message: `are you lost? ${req.method} ${req.url} is not registered!`,
        data: null
    });
});

module.exports = app;
