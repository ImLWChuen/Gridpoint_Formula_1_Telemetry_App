export const TIMEZONES = [
  {
    label: "Device Time",
    value: "device",
  },
  {
    label: "Race Local Time",
    value: "race",
  },
  {
    label: "Malaysia",
    value: "Asia/Kuala_Lumpur",
  },
  {
    label: "United Kingdom",
    value: "Europe/London",
  },
  {
    label: "Central Europe",
    value: "Europe/Paris",
  },
  {
    label: "US Eastern",
    value: "America/New_York",
  },
  {
    label: "US Central",
    value: "America/Chicago",
  },
  {
    label: "US Pacific",
    value: "America/Los_Angeles",
  },
  {
    label: "Japan",
    value: "Asia/Tokyo",
  },
  {
    label: "Australia Eastern",
    value: "Australia/Sydney",
  },
] as const;

export type TimezoneValue =
  | "device"
  | "race"
  | string;

export function getDeviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatDateTime(
  date: string,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat("en-MY", {
    timeZone: timezone,
    ...options,
  }).format(new Date(date));
}

