const {parse} = require('csv-parse')
const path = require('path')
const fs = require('fs')
const planets = require('./planets.mongo')

const isHabitablePlanet = (planet) => {
    return planet["koi_disposition"] === "CONFIRMED"
    && planet["koi_insol"] > 0.36 && planet["koi_insol"] < 1.11
    && planet ["koi_prad"] < 1.6
}

function loadPlanets() {
    return new Promise((resolve,reject)=>{
        fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
          .pipe(parse({
            comment:'#',
            columns:true,
          }))
          .on("data",async (data) => {
            if(isHabitablePlanet(data))
            {
              savePlanet(data);
            }
          })
          .on("error",(err) => {
            console.log(err);
            reject(err);
          })  
          .on("end",async () => {
            const count = (await (getPlanets())).length
            console.log(`${count} habitable planets found`)
            resolve();
          })
    })
}

async function getPlanets() {
  return await planets.find({},{
    "__v":0,"_id":0 
  })
}

async function savePlanet(data) {
  try {
    await planets.updateOne({
      keplerName: data.kepler_name
    }, {
      keplerName: data.kepler_name
    }, {
      upsert: true
    })
  } catch (error) {
    console.error("Could not save planet")
  }
}

module.exports = {
    loadPlanets,
    getPlanets
}  