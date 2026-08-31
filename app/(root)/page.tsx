import Countdown from "@/components/dashboard/Countdown";
import Sessions from "@/components/dashboard/Sessions";
import NewsWidget from "@/components/dashboard/NewsWidget";

interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_name: string;
  date_start: string;
  date_end: string;
}

interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
}

/*
 * IANA timezone for each F1 race location.
 *
 * This allows the Countdown and Sessions components
 * to display the correct local race time, including
 * daylight-saving-time changes.
 */
const RACE_TIMEZONES: Record<string, string> = {
  Australia: "Australia/Melbourne",
  Bahrain: "Asia/Bahrain",
  Japan: "Asia/Tokyo",
  China: "Asia/Shanghai",
  "United States": "America/New_York",
  Canada: "America/Toronto",
  Monaco: "Europe/Monaco",
  Spain: "Europe/Madrid",
  Austria: "Europe/Vienna",
  "United Kingdom": "Europe/London",
  Belgium: "Europe/Brussels",
  Hungary: "Europe/Budapest",
  Netherlands: "Europe/Amsterdam",
  Italy: "Europe/Rome",
  Azerbaijan: "Asia/Baku",
  Singapore: "Asia/Singapore",
  Mexico: "America/Mexico_City",
  Brazil: "America/Sao_Paulo",
  Qatar: "Asia/Qatar",
  "Saudi Arabia": "Asia/Riyadh",
  "United Arab Emirates": "Asia/Dubai",
};

/*
 * Get all 2026 F1 meetings.
 */
async function getMeetings(): Promise<Meeting[]> {
  const response = await fetch(
    "https://api.openf1.org/v1/meetings?year=2026",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch meetings");
  }

  return response.json();
}

/*
 * Get all sessions for a specific meeting.
 */
async function getSessions(
  meetingKey: number
): Promise<Session[]> {
  const response = await fetch(
    `https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}`,
{
    cache: "no-store",
}
);

if (!response.ok) {
    throw new Error("Failed to fetch sessions");
}

return response.json();
}

export default async function Home() {
    /*
     * Get all 2026 meetings.
     */
    const meetings = await getMeetings();

    /*
     * Current date/time.
     *
     * JavaScript Date automatically represents the
     * current absolute point in time.
     */
    const now = new Date();

    /*
     * Find meetings that have not started yet.
     *
     * Sort them from earliest to latest.
     */
    const upcomingMeetings = meetings
        .filter(
            (meeting) =>
                new Date(meeting.date_start) > now
        )
        .sort(
            (a, b) =>
                new Date(a.date_start).getTime() -
                new Date(b.date_start).getTime()
        );

    /*
     * Get the next Grand Prix weekend.
     */
    const nextMeeting = upcomingMeetings[0];

    /*
     * Handle the case where there are no upcoming
     * Grand Prix weekends.
     */
    if (!nextMeeting) {
        return (
            <main className="min-h-screen bg-black p-8 text-white">
                <h1 className="text-3xl font-bold">
                    No upcoming Grand Prix
                </h1>
            </main>
        );
    }

    /*
     * Get all sessions for the next Grand Prix.
     */
    const allSessions = await getSessions(
        nextMeeting.meeting_key
    );

    /*
     * Keep only the sessions we want to display.
     */
    const sessions = allSessions
        .filter((session) =>
            [
                "Practice",
                "Qualifying",
                "Race",
                "Sprint",
            ].includes(session.session_type)
        )
        .sort(
            (a, b) =>
                new Date(a.date_start).getTime() -
                new Date(b.date_start).getTime()
        );

    /*
     * Find the actual Race session.
     *
     * This is important because:
     *
     * nextMeeting.date_start
     * = start of the Grand Prix weekend
     *
     * raceSession.date_start
     * = actual Race start
     */
    const raceSession = sessions.find(
        (session) =>
            session.session_name === "Race"
    );

    /*
     * Determine the local timezone of the race.
     */
    const raceTimezone =
        RACE_TIMEZONES[
            nextMeeting.country_name
            ] ?? "UTC";

    return (
        <main className="min-h-screen bg-black p-8 text-white">
            <div className="mx-auto max-w-7xl">

                {/* Page Header */}
                <div className="mb-8">
                    <p className="text-sm uppercase tracking-widest text-zinc-400">
                        Formula 1
                    </p>

                    <h1 className="text-4xl font-bold">
                        Dashboard
                    </h1>
                </div>

                {/* Next Grand Prix */}
                <section className="mb-8 rounded-2xl bg-zinc-950 p-6">

                    <div className="mb-6">
                        <p className="text-sm text-zinc-400">
                            NEXT GRAND PRIX
                        </p>

                        <h2 className="text-3xl font-bold">
                            {nextMeeting.meeting_name}
                        </h2>

                        <p className="text-zinc-400">
                            {nextMeeting.location},{" "}
                            {nextMeeting.country_name}
                        </p>
                    </div>

                    {/* Countdown */}
                    <Countdown
                        targetDate={
                            raceSession?.date_start ??
                            nextMeeting.date_start
                        }
                        raceTimezone={raceTimezone}
                    />

                </section>

                {/* Upcoming Sessions */}
                <section className="rounded-2xl bg-zinc-950 p-6">

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">
                            Upcoming Sessions
                        </h2>

                        <p className="text-sm text-zinc-400">
                            {nextMeeting.meeting_name}
                        </p>
                    </div>

                    <Sessions
                        sessions={sessions}
                        raceTimezone={raceTimezone}
                    />

                </section>

                {/* Latest News */}
                <section className="mt-8">
                    <NewsWidget />
                </section>

            </div>
        </main>
    );
}
