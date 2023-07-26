const axios = require('axios');

const launchesDb = require('./launches.mongo');
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function findLaunch(filter) {
    return await launchesDb.findOne(filter);
}
  
async function launchExistsWithId(id) {
    return await findLaunch({flightNumber:id})
}

async function addLaunch(launch){
    const planet = await planets.findOne({
        keplerName:launch.target
    });

    if(!planet) {
        throw new Error("No such target planet found!")
    }

    const latestFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch,{
        flightNumber:latestFlightNumber,
        customers:['ZTM','NASA'],
        upcoming:true,
        success:true
    })
  
    await saveLaunch(newLaunch);
}

async function deleteLaunch(flightNumber){
    const aborted = await launchesDb.updateOne({
        flightNumber
    },{
        upcoming:false,
        success:false
    })

    return aborted.modifiedCount === 1;
}

async function saveLaunch(launch) {
    await launchesDb.findOneAndUpdate({
        flightNumber:launch.flightNumber
    },launch,{upsert:true})
}

async function getLatestFlightNumber() {
    const launch = await launchesDb.findOne().sort("-flightNumber");

    if(!launch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return launch.flightNumber
}

async function getLaunches(skip,limit) {
    try {
        return await launchesDb.find({},{"_id":0,"__v":0})
        .sort({flightNumber:1})
        .skip(skip)
        .limit(limit)
    } catch (error) {
        console.log(error)
    }
}

async function getSpaceXLaunches() {

    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });
    if (firstLaunch) {
        console.log('Launch data already loaded!');
    } else {
        const response = await axios.post(SPACEX_API_URL, {
            query: {},
            options: {
              pagination: false,
              populate: [
                {
                  path: 'rocket',
                  select: {
                    name: 1
                  }
                },
                {
                  path: 'payloads',
                  select: {
                    'customers': 1
                  }
                }
              ]
            }
        });
    
        if (response.status !== 200) {
            console.log('Problem downloading launch data');
            throw new Error('Launch data download failed');
        }
    
        const launchDocs = response.data.docs;
        for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });
    
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        };  
    
        console.log(`${launch.flightNumber} ${launch.mission}`);
    
        await saveLaunch(launch);
    }

}}

module.exports = {
    getLaunches,
    getSpaceXLaunches,
    addLaunch,
    launchExistsWithId,
    deleteLaunch
};
