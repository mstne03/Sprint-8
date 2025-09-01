import crypto from 'crypto'

function buildDriverUID({ full_name, name_acronym }) {
  const raw = `${(full_name).trim()}|${(name_acronym).trim()}`.toLowerCase();
  return crypto.createHash('sha1').update(raw).digest('hex');
}

export function mapDriver(raw, season) {
    return {
        driver_uid: raw.driver_uid,
        driver_number: raw.driver_number,
        broadcast_name: raw.broadcast_name,
        full_name: raw.full_name,
        first_name: raw.first_name,
        last_name: raw.last_name,
        name_acronym: raw.name_acronym,
        team_name: raw.team_name,
        team_color: raw.team_color,
        country_code: raw.country_code,
        last_seen_season: season,
    }
}

export function mapDriverSeason(raw, season) {
    return {
        season: Number(season),
        driver_uid: buildDriverUID(raw),
        driver_number: raw.driver_number,
        broadcast_name: raw.broadcast_name,
        name_acronym: raw.name_acronym,
        first_name: raw.first_name,
        last_name: raw.last_name,
        full_name: raw.full_name,
        country_code: raw.country_code,
        headshot_url: raw.headshot_url,
    }
}

export function mapMeeting(raw) {
    return {
        circuit_key: raw.circuit_key,
        circuit_short_name: raw.circuit_short_name,
        country_code: raw.country_code,
        country_key: raw.country_key,
        country_name: raw.country_name,
        date_start: raw.date_start,
        location: raw.location,
        meeting_key: raw.meeting_key,
        meeting_name: raw.meeting_name,
        year: raw.year,
    }
}
