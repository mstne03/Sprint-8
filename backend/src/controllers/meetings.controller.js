import { openf1Get, paths } from '../services/openf1.rest.js'
import { upsertMeeting } from '../repositories/meeting.repo.js'
import Meeting from '../models/Meeting.js'
import { sleep } from '../utils/sleep.js'

export const fetchAndSaveMeetings = async () => {
  try {
    const years = process.env.AVAILABLE_YEARS.split(',').map(Number);

    console.log(`Fetching meetings from OpenF1 API for years ${years}...`);

    for (const year of years) {
      const rawMeetings = await openf1Get(paths.meetings, { year });

      const mappedMeetings = rawMeetings.map(upsertMeeting);

      await Meeting.bulkWrite(mappedMeetings);

      await sleep(400);
    }

    console.log("Meetings imported successfully");
  } catch (e) {
    console.error('Error in fetchAndSaveMeetings:', e.message);
  }
};
