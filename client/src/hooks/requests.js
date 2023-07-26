async function httpGetPlanets() {
  const response = await fetch('http://localhost:8000/v1/planets');
  return await response.json()
}

async function httpGetLaunches() {
  const response = await fetch('http://localhost:8000/v1/launches');
  const fetchedLaunches = await response.json();
  return fetchedLaunches.sort((a,b)=>{
    return a.flightNumber - b.flightNumber; 
  })
}

async function httpSubmitLaunch(launch) {
  try {
    return await fetch("http://localhost:8000/v1/launches",{
      method:"post",
      headers:{
        'Content-Type':"application/json"
      },
      body:JSON.stringify(launch)
    })
  } catch (error) {
    return {
      ok:false
    }
  }
}

async function httpAbortLaunch(id) {
  try {
    return await fetch(`http://localhost:8000/v1/launches/${id}`,{
      method:"delete",
    })
  } catch (error) {
    return {
      ok:false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};