const http = require("http");
require('dotenv').config();
const {loadPlanets} = require("./models/planets.model");
const {getSpaceXLaunches} = require("./models/launches.model");
const {mongoConnect} = require('./services/mongo');
const app = require('./app');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const startServer = async () => {
    await mongoConnect()
    await loadPlanets();
    await getSpaceXLaunches();

    server.listen(PORT,()=>{
        console.log(`Listening on PORT ${PORT}`)
    })
}

startServer();