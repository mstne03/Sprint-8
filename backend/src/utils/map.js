import crypto from 'crypto'

function buildDriverUID({ full_name, name_acronym }) {
  const raw = `${(full_name).trim()}|${(name_acronym).trim()}`.toLowerCase();
  return crypto.createHash('sha1').update(raw).digest('hex');
}

function buildChartKey(key) {
    return crypto.createHash('sha1').update(key).digest('hex');
}

export function mapDriver(raw, season) {
    return {
        driverUid: raw.driverUid,
        driverNumber: raw.driverNumber,
        fullName: raw.fullName,
        nameAcronym: raw.nameAcronym,
        team: raw.team,
        teamColour: raw.teamColour,
        countryCode: raw.countryCode,
        season: season,
    }
}

export function mapDriverSeason(raw, season) {
    return {
        season: Number(season),
        driver_uid: buildDriverUID(raw),
        driver_number: raw.driver_number,
        name_acronym: raw.name_acronym,
        full_name: raw.full_name,
        team_name: raw.team_name,
        team_colour: raw.team_colour,
        country_code: raw.country_code,
        headshot_url: raw.headshot_url,
    }
}

export function mapQualiChart(raw) {
    const charts = []

    for (const chart of raw) {
        charts.push({
            key: buildChartKey(chart.key),
            searchKey: chart.key,
            team: chart.team,
            drivers: chart.drivers,
            driversAcr: chart.drivers_acr,
            chartType: chart.chart_type,
            sessionType: chart.session_type,
            year: chart.year,
            svg: chart.svg,
            eventName: chart.event_name
        });
    }

    return charts
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
