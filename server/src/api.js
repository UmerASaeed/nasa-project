const express = require('express');

const api = express.Router();

const planetsRouter = require('./routes/planets/planets.route')
const launchRouter = require('./routes/launches/launches.route');

api.use("/launches",launchRouter);
api.use("/planets",planetsRouter);

module.exports = api;