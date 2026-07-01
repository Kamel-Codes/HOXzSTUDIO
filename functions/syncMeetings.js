const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { google } = require("googleapis");

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/calendar"]
);

const calendar = google.calendar({
  version: "v3",
  auth,
});

exports.syncMeeting = onCall(
  {
    region: "us-central1",
    enforceAppCheck: true,
    maxInstances: 10,
  },
  async (request) => {
    const {
      name,
      email,
      reason,
      startTime,
      endTime,
    } = request.data;

    if (!name || !email || !startTime || !endTime) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields."
      );
    }

    try {
      await auth.authorize();

      const event = await calendar.events.insert({
        calendarId: process.env.CALENDAR_ID || "primary",

        conferenceDataVersion: 1,

        sendUpdates: "all",

        requestBody: {
          summary: `Meeting with ${name}`,

          description: reason || "",

          start: {
            dateTime: startTime,
          },

          end: {
            dateTime: endTime,
          },

          attendees: [
            {
              email,
            },
          ],

          conferenceData: {
            createRequest: {
              requestId: Date.now().toString(),

              conferenceSolutionKey: {
                type: "hangoutsMeet",
              },
            },
          },
        },
      });

      return {
        status: "success",
        id: event.data.id,
        link: event.data.hangoutLink,
      };
    } catch (err) {
      console.error(err);

      throw new HttpsError(
        "internal",
        err.message || "Unable to create meeting."
      );
    }
  }
);