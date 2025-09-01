import { openf1Get, paths } from '../services/openf1.rest.js'
import { createMeeting } from '../repositories/meeting.repo.js'
import { mapMeeting } from '../utils/map.js'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAndSaveMeetings = async (req, res) => {
  try {
    const years = req.query.years.split(',').map(y => y.trim());

    console.log(`Fetching meetings from OpenF1 API for years ${years}...`);

    for (const year of years) {
      const rawMeetings = await openf1Get(paths.meetings, { year });

      const mappedMeetings = rawMeetings.map(mapMeeting);

      await Promise.all(mappedMeetings.map(createMeeting));

      await sleep(300);
    }

    res.status(200).json({ message: 'Meetings imported successfully' });
  } catch (error) {
    console.error('Error in fetchAndSaveMeetings:', error);
    res.status(500).json({ message: 'Error fetching and saving meetings', error: error.message });
  }
};
