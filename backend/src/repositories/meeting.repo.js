import Meeting from '../models/Meeting.js'

export const createMeeting = async (meetingData) => {
    try {
        return await Meeting.updateOne(
            { year: meetingData.year, meeting_key: meetingData.meeting_key },
            { $set: meetingData },
            { upsert: true }
        );
    } catch (error) {
        throw error;
    }
}

export const getMeetings = async (year) => {
    return await Meeting.find({ year }).sort({ date_start: 1 }).lean();
}

function escapeRegex(s="") { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export async function searchMeetingsByName({ q, year, limit = 20, page = 1 }) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
  const safePage  = Math.max(1, Number(page) || 1);

  const filter = {};
  if (year != null) filter.year = Number(year);

  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), "i");
    filter.$or = [
      { meeting_name: rx },
      { meeting_official_name: rx },
      { event_name: rx },
      { circuit_short_name: rx },
      { circuit_name: rx },
      { location: rx },
    ];
  }

  return Meeting.find(filter)
    .collation({ locale: "es", strength: 1 })
    .sort({ date_start: 1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();
}
