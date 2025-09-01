const GPpoints = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1,
    fastestLap: false,
}

export function calcPoints(driverResults) {
    const points = driverResults.fastestLap ? 
        GPpoints[driverResults.position] + 1 :
        GPpoints[driverResults.position];

    return points;
}
