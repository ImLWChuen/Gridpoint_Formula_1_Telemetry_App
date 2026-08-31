"use client";

import { useEffect, useState } from "react";

interface Session {
    session_key: number;
    session_name: string;
    session_type: string;
    date_start: string;
    date_end: string;
    meeting_key: number;
}

interface SessionsProps {
    sessions: Session[];
    raceTimezone?: string;
}

interface TimezoneOption {
    label: string;
    value: string;
    offset: number | null;
}

/*
 * Generate UTC offsets from UTC-12 to UTC+14.
 */
const UTC_TIMEZONES: TimezoneOption[] = [
    ...Array.from({ length: 27 }, (_, index) => {
        const offset = index - 12;

        const sign = offset >= 0 ? "+" : "-";
        const absoluteOffset = Math.abs(offset);

        return {
            label: `UTC${sign}${absoluteOffset}`,
            value: `UTC${sign}${absoluteOffset}`,
            offset,
        };
    }),
];

/*
 * Convert an IANA timezone into a user-friendly
 * location name.
 *
 * Examples:
 *
 * Asia/Kuala_Lumpur → Kuala Lumpur
 * Europe/Rome       → Rome
 * Europe/London     → London
 * America/New_York  → New York
 */
function formatTimezoneName(
    timezone: string
): string {
    const city =
        timezone.split("/").pop() ?? timezone;

    return city.replaceAll("_", " ");
}

/*
 * Get a short timezone abbreviation such as:
 *
 * Kuala Lumpur → GMT+8
 * Rome         → GMT+2
 * London       → GMT+1
 */
function getTimezoneAbbreviation(
    timezone: string
): string {
    try {
        const parts = new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: timezone,
                timeZoneName: "short",
            }
        ).formatToParts(new Date());

        return (
            parts.find(
                (part) =>
                    part.type ===
                    "timeZoneName"
            )?.value ?? timezone
        );
    } catch {
        return timezone;
    }
}

const getSessionLabel = (
    session: Session
) => {
    if (
        session.session_name ===
        "Practice 1"
    ) {
        return "FP1";
    }

    if (
        session.session_name ===
        "Practice 2"
    ) {
        return "FP2";
    }

    if (
        session.session_name ===
        "Practice 3"
    ) {
        return "FP3";
    }

    if (
        session.session_name ===
        "Qualifying"
    ) {
        return "QUALI";
    }

    if (
        session.session_name ===
        "Sprint"
    ) {
        return "SPRINT";
    }

    if (
        session.session_name ===
        "Race"
    ) {
        return "RACE";
    }

    return session.session_name;
};

export default function Sessions({
    sessions,
    raceTimezone,
}: SessionsProps) {
    /*
     * Device Time is selected by default.
     */
    const [
        timezone,
        setTimezone,
    ] = useState("device");

    /*
     * Browser's detected timezone.
     */
    const [
        deviceTimezone,
        setDeviceTimezone,
    ] = useState("UTC");

    /*
     * Prevent hydration mismatch.
     */
    const [
        mounted,
        setMounted,
    ] = useState(false);

    /*
     * Detect device timezone and load
     * saved preference.
     */
    useEffect(() => {
        const detectedTimezone =
            Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone;

        setDeviceTimezone(
            detectedTimezone
        );

        const savedTimezone =
            localStorage.getItem(
                "f1-countdown-timezone"
            );

        if (savedTimezone) {
            setTimezone(
                savedTimezone
            );
        }

        setMounted(true);
    }, []);

    /*
     * Determine the actual IANA timezone
     * used for displaying session times.
     */
    const getActualTimezone = (): string => {
        /*
         * Device Time
         */
        if (
            timezone === "device"
        ) {
            return deviceTimezone;
        }

        /*
         * Race Local Time
         */
        if (
            timezone === "race"
        ) {
            return (
                raceTimezone ??
                "UTC"
            );
        }

        /*
         * UTC offset
         */
        const selectedOption =
            UTC_TIMEZONES.find(
                (zone) =>
                    zone.value ===
                    timezone
            );

        if (
            selectedOption &&
            selectedOption.offset !==
                null
        ) {
            return "UTC";
        }

        return timezone;
    };

    /*
     * Format session date/time.
     */
    const formatDate = (
        date: string
    ): string => {
        const actualTimezone =
            getActualTimezone();

        /*
         * Fixed UTC offset.
         */
        const selectedOption =
            UTC_TIMEZONES.find(
                (zone) =>
                    zone.value ===
                    timezone
            );

        if (
            selectedOption &&
            selectedOption.offset !==
                null
        ) {
            const originalDate =
                new Date(date);

            const adjustedTime =
                originalDate.getTime() +
                selectedOption.offset *
                    60 *
                    60 *
                    1000;

            return new Date(
                adjustedTime
            ).toLocaleString(
                "en-MY",
                {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone:
                        "UTC",
                }
            );
        }

        /*
         * Device or Race Local Time.
         */
        return new Intl.DateTimeFormat(
            "en-MY",
            {
                timeZone:
                    actualTimezone,
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
            }
        ).format(
            new Date(date)
        );
    };

    /*
     * Get the friendly timezone name
     * shown underneath the session selector.
     */
    const getDisplayedTimezone =
        (): string => {
            if (
                timezone ===
                "device"
            ) {
                return formatTimezoneName(
                    deviceTimezone
                );
            }

            if (
                timezone ===
                "race"
            ) {
                return formatTimezoneName(
                    raceTimezone ??
                        "UTC"
                );
            }

            return timezone;
        };

    /*
     * Handle timezone selection.
     */
    const handleTimezoneChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedTimezone =
            event.target.value;

        setTimezone(
            selectedTimezone
        );

        /*
         * Use the same localStorage key
         * as Countdown.tsx.
         */
        localStorage.setItem(
            "f1-countdown-timezone",
            selectedTimezone
        );
    };

    /*
     * Avoid rendering browser-dependent
     * timezone information during SSR.
     */
    if (!mounted) {
        return (
            <div className="space-y-4">

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-white">
                            Session Times
                        </p>

                        <p className="text-xs text-zinc-500">
                            Displayed in your selected timezone
                        </p>
                    </div>

                    <select
                        disabled
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-500 outline-none"
                    >
                        <option>
                            Device Time
                        </option>
                    </select>
                </div>

                <div className="space-y-3">
                    {sessions.map(
                        (session) => (
                            <div
                                key={
                                    session.session_key
                                }
                                className="flex items-center justify-between rounded-xl bg-zinc-900 p-4"
                            >
                                <div>
                                    <p className="font-bold">
                                        {getSessionLabel(
                                            session
                                        )}
                                    </p>

                                    <p className="text-sm text-zinc-400">
                                        {
                                            session.session_name
                                        }
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>

            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* Timezone Selector */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <p className="text-sm font-medium text-white">
                        Session Times
                    </p>

                    <p className="text-xs text-zinc-500">
                        Displayed in your selected timezone
                    </p>
                </div>

                <select
                    value={timezone}
                    onChange={
                        handleTimezoneChange
                    }
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition hover:border-zinc-500 focus:border-zinc-400"
                    aria-label="Select timezone"
                >

                    {/* Device Time */}
                    <option value="device">
                        Device Time (
                        {formatTimezoneName(
                            deviceTimezone
                        )}
                        )
                    </option>

                    {/* Race Local Time */}
                    <option value="race">
                        Race Local Time (
                        {formatTimezoneName(
                            raceTimezone ??
                                "UTC"
                        )}
                        )
                    </option>

                    {/* UTC offsets */}
                    {UTC_TIMEZONES.map(
                        (zone) => (
                            <option
                                key={
                                    zone.value
                                }
                                value={
                                    zone.value
                                }
                            >
                                {
                                    zone.label
                                }
                            </option>
                        )
                    )}

                </select>
            </div>

            {/* Selected timezone */}
            <p className="text-right text-xs text-zinc-500">
                {getDisplayedTimezone()}
            </p>

            {/* Sessions */}
            <div className="space-y-3">

                {sessions.map(
                    (session) => (
                        <div
                            key={
                                session.session_key
                            }
                            className="flex items-center justify-between rounded-xl bg-zinc-900 p-4"
                        >

                            {/* Session information */}
                            <div>
                                <p className="font-bold">
                                    {getSessionLabel(
                                        session
                                    )}
                                </p>

                                <p className="text-sm text-zinc-400">
                                    {
                                        session.session_name
                                    }
                                </p>
                            </div>

                            {/* Session time */}
                            <div className="text-right">

                                <p className="text-sm font-medium">
                                    {formatDate(
                                        session.date_start
                                    )}
                                </p>

                                <p className="text-xs text-zinc-500">
                                    Ends{" "}
                                    {formatDate(
                                        session.date_end
                                    )}
                                </p>

                            </div>

                        </div>
                    )
                )}

            </div>

        </div>
    );
}

