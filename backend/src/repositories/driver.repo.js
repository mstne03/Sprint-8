import Driver from '../models/Driver.js'
import { DriverSeason } from '../models/Driver_Season.js'

export const upsertDriver = async (driverData) => {
    try {
        return await DriverSeason.updateOne(
            { season: driverData.season, driver_uid: driverData.driver_uid },
            { $set: driverData },
            { upsert: true }
        );
    } catch (error) {
        throw error;
    }
}

export async function upsertDriversBulk(drivers = [], season) {
    const ops = (drivers).map(d => {
        const driver_uid = String(d.driver_uid).trim();

        if (!driver_uid) return null;
        
        const {
            broadcast_name,
            full_name,
            first_name,
            last_name,
            name_acronym,
            country_code,
        } = d;

        const onInsert = {
            broadcast_name,
            name_acronym,
            first_name,
            last_name,
            full_name,
            country_code,
        };

        const update = {
            $setOnInsert: onInsert,
            $max: { last_seen_season: season }
        };

        return {
            updateOne: {
                filter: { driver_uid },
                update,
                upsert: true,
            }
        };
    })
    .filter(Boolean);

    if (!ops.length) return { upserts: 0, modified: 0 };

    const res = await Driver.bulkWrite(ops, { ordered: false });

    return {
        upserts: 
            res.upsertedCount ??
            res.result?.nUpserted ??
            (Array.isArray(res.result?.upserted) ? res.result.upserted.length : 0) ?? 0,
        modified: res.modifiedCount ?? res.nModified ?? res.result?.nModified ?? 0,
    };
}

export async function upsertDriversBulkSeason(drivers = []) {
    const ops = drivers.map(d => {
        const season = Number(d.season);
        const driver_number = Number(d.driver_number);
        const driver_uid = String(d.driver_uid).trim();

        if (!Number.isInteger(season) || !Number.isInteger(driver_number) || !driver_uid) return null;

        const {
            broadcast_name,
            name_acronym,
            first_name,
            last_name,
            full_name,
            team_name,
            team_colour,
            country_code,
            headshot_url,
        } = d;

        const seasonSet = {
            driver_number,
            team_name,
            team_colour,
            headshot_url,
        };

        const onInsert = {
            season,
            driver_uid,
            broadcast_name,
            name_acronym,
            first_name,
            last_name,
            full_name,
            country_code,
        };

        return {
            updateOne: {
                filter: { season, driver_uid },
                update: { $set: seasonSet, $setOnInsert: onInsert },
                upsert: true
            }
        };
    })
    .filter(Boolean);

    if (!ops.length) return { upserts: 0, modified: 0 };

    const res = await DriverSeason.bulkWrite(ops, { ordered: false });

    const upserts =
        res.upsertedCount ??
        res.result?.nUpserted ??
        (Array.isArray(res.result?.upserted) ? res.result.upserted.length : 0) ?? 0;

    const modified =
        res.modifiedCount ??
        res.nModified ??
        res.result?.nModified ?? 0;

    return { upserts, modified };
}
