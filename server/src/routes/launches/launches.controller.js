const {getLaunches,addLaunch,launchExistsWithId,deleteLaunch} = require('../../models/launches.model')
const {getPagination} = require("../../services/query")

async function getAllLaunches(req,res) {
    const {limit,skip} = getPagination(req.query);
    return res.status(200).json(await getLaunches(skip,limit))
}

async function httpAddLaunch(req,res) {
    let launch = req.body;
    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) 
    {
        return res.status(400).json({
            error:"missing required values"
        })
    }
    
    launch.launchDate = new Date(launch.launchDate);
    if(isNaN(launch.launchDate))
    {
        return res.status(400).json({
            error:"invalid date"
        })
    }

    await addLaunch(launch)
    return res.status(201).json(launch)
}

async function httpDeleteLaunch(req,res) {
    const launchId = Number(req.params.id);

    const existsLaunch = await launchExistsWithId(launchId);
    if(!existsLaunch)
    {
        return res.status(404).json({
            error:"Launch Not Found"
        })
    }

    const aborted = deleteLaunch(launchId);

    if(!aborted) {
        return res.status(400).json({
            error:"abort failed"
        })    
    }

    return res.status(200).json({
        ok:true
    })
}

module.exports = {
    getAllLaunches,
    httpAddLaunch,
    httpDeleteLaunch
};