const express = require("express");
const launchRouter = express.Router();

const {getAllLaunches,httpAddLaunch,httpDeleteLaunch} = require('./launches.controller')

launchRouter.get('/',getAllLaunches);
launchRouter.post('/',httpAddLaunch);
launchRouter.delete('/:id',httpDeleteLaunch);

module.exports = launchRouter;