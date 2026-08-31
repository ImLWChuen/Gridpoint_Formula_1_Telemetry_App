"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
  raceTimezone?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimezoneOption {
  label: string;
  value: string;
  offset: number | null;
}

const EMPTY_TIME: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

/*
 * Generate UTC offsets from UTC-12 to UTC+14.
 */
const UTC_TIMEZONES: TimezoneOption[] = [
  {
    label: "Device Time",
    value: "device",
    offset: null,
  },

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
 * Calculate the remaining time until the target.
 *
 * The countdown itself is timezone-independent because
 * JavaScript Date stores an absolute point in time.
 */
function calculateTimeLeft(
  targetDate: string
): TimeLeft {
  const target =
    new Date(targetDate).getTime();

  if (Number.isNaN(target)) {
    return EMPTY_TIME;
  }

  const difference =
    target - Date.now();

  if (difference <= 0) {
    return EMPTY_TIME;
  }

  return {
    days: Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    ),

    hours: Math.floor(
      (difference /
        (1000 * 60 * 60)) %
        24
    ),

    minutes: Math.floor(
      (difference /
        (1000 * 60)) %
        60
    ),

    seconds: Math.floor(
      (difference / 1000) % 60
    ),
  };
}

function padNumber(
  value: number
): string {
  return value
    .toString()
    .padStart(2, "0");
}

/*
 * Format a date using a fixed UTC offset.
 */
function formatDateWithOffset(
  date: string,
  offset: number
): string {
  const originalDate =
    new Date(date);

  const adjustedTime =
    originalDate.getTime() +
    offset *
      60 *
      60 *
      1000;

  const adjustedDate =
    new Date(adjustedTime);

  return adjustedDate.toLocaleString(
    "en-MY",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
      timeZone: "UTC",
    }
  );
}

export default function Countdown({
  targetDate,
  raceTimezone = "UTC",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] =
    useState<TimeLeft>(
      EMPTY_TIME
    );

  const [mounted, setMounted] =
    useState(false);

  /*
   * Device Time is selected by default.
   */
  const [
    selectedTimezone,
    setSelectedTimezone,
  ] = useState("device");

  /*
   * Browser's detected IANA timezone.
   */
  const [
    deviceTimezone,
    setDeviceTimezone,
  ] = useState("UTC");

  /*
   * Detect device timezone and restore
   * the user's saved preference.
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
      setSelectedTimezone(
        savedTimezone
      );
    }

    setMounted(true);
  }, []);

  /*
   * Countdown timer.
   */
  useEffect(() => {
    const updateCountdown =
      () => {
        setTimeLeft(
          calculateTimeLeft(
            targetDate
          )
        );
      };

    updateCountdown();

    const timer =
      setInterval(
        updateCountdown,
        1000
      );

    return () => {
      clearInterval(timer);
    };
  }, [targetDate]);

  /*
   * Handle timezone selection.
   */
  const handleTimezoneChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value =
      event.target.value;

    setSelectedTimezone(value);

    localStorage.setItem(
      "f1-countdown-timezone",
      value
    );
  };

  /*
   * Format target date according
   * to the selected timezone.
   */
  let formattedTargetDate =
    "";

  let displayedTimezone =
    "";

  if (mounted) {

    /*
     * Device Time
     */
    if (
      selectedTimezone ===
      "device"
    ) {
      formattedTargetDate =
        new Intl.DateTimeFormat(
          "en-MY",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
            timeZone:
              deviceTimezone,
          }
        ).format(
          new Date(targetDate)
        );

      displayedTimezone =
        formatTimezoneName(
          deviceTimezone
        );
    }

    /*
     * Race Local Time
     */
    else if (
      selectedTimezone ===
      "race"
    ) {
      formattedTargetDate =
        new Intl.DateTimeFormat(
          "en-MY",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
            timeZone:
              raceTimezone,
          }
        ).format(
          new Date(targetDate)
        );

      displayedTimezone =
        formatTimezoneName(
          raceTimezone
        );
    }

    /*
     * Fixed UTC offset
     */
    else {
      const selectedOption =
        UTC_TIMEZONES.find(
          (timezone) =>
            timezone.value ===
            selectedTimezone
        );

      if (
        selectedOption &&
        selectedOption.offset !==
          null
      ) {
        formattedTargetDate =
          formatDateWithOffset(
            targetDate,
            selectedOption.offset
          );

        displayedTimezone =
          selectedOption.label;
      }
    }
  }

  const countdownUnits = [
    {
      value: timeLeft.days,
      label: "DAYS",
    },
    {
      value: timeLeft.hours,
      label: "HOURS",
    },
    {
      value: timeLeft.minutes,
      label: "MINUTES",
    },
    {
      value: timeLeft.seconds,
      label: "SECONDS",
    },
  ];

  return (
    <div className="space-y-5">

      {/* Countdown */}
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        aria-label="Countdown to the next Grand Prix"
      >
        {countdownUnits.map(
          (unit) => (
            <div
              key={unit.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center"
            >
              <div
                className="text-3xl font-bold tabular-nums sm:text-4xl"
                aria-hidden="true"
              >
                {padNumber(
                  unit.value
                )}
              </div>

              <div className="mt-1 text-xs font-medium tracking-wider text-zinc-400">
                {unit.label}
              </div>
            </div>
          )
        )}
      </div>

      {/* Race Start Time */}
      {mounted && (
        <div className="space-y-3 text-center">

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Race starts
            </p>

            <p className="mt-1 text-sm font-medium text-zinc-300">
              {formattedTargetDate}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {displayedTimezone}
            </p>
          </div>

          {/* Timezone Selector */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-zinc-500">
              Timezone:
            </span>

            <select
              value={
                selectedTimezone
              }
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
                  raceTimezone
                )}
                )
              </option>

              {/* UTC offsets */}
              {UTC_TIMEZONES
                .filter(
                  (timezone) =>
                    timezone.value !==
                    "device"
                )
                .map(
                  (timezone) => (
                    <option
                      key={
                        timezone.value
                      }
                      value={
                        timezone.value
                      }
                    >
                      {
                        timezone.label
                      }
                    </option>
                  )
                )}

            </select>
          </div>

        </div>
      )}

    </div>
  );
}
