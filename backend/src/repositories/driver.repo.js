import { mapDriverSeason, mapDriver } from '../utils/map.js'

export function upsertDriversSeason (driver, year) {
    const {
        driver_uid,
        season,
        driver_number,
        name_acronym,
        full_name,
        team_name,
        team_colour,
        country_code,
        headshot_url,
    } = mapDriverSeason(driver, year);

    return {
        updateOne: {
            filter: {
                driver_uid,
                season,
            },
            update: {
                $set: {    
                    driver_number,
                    name_acronym,
                    full_name,
                    country_code,
                    team_name,
                    team_colour,
                    headshot_url,
                }
            },
            upsert: true,
        }
    }
}

export function upsertDrivers (driver) {
    const {
        driver_uid,
        last_seen_season,
        driver_number,
        name_acronym,
        full_name,
        team_name,
        team_colour,
        country_code,
    } = mapDriver(driver, driver.season);

    return {
        updateOne: {
            filter: { driver_uid },
            update: { 
                $set: {
                    driver_number,
                    name_acronym,
                    full_name,
                    team_name,
                    team_colour,
                    country_code,
                    last_seen_season,
                },
            },
            upsert: true,
        }
    }
}
