"use client";

import { useEffect, useState } from "react";
import {
  TIMEZONES,
  getDeviceTimezone,
} from "@/lib/timezone";

interface TimezoneSelectorProps {
  raceTimezone?: string;
  onTimezoneChange?: (timezone: string) => void;
}

export default function TimezoneSelector({
  raceTimezone,
  onTimezoneChange,
}: TimezoneSelectorProps) {
  const [timezone, setTimezone] = useState("device");

  useEffect(() => {
    const savedTimezone =
      localStorage.getItem("f1-timezone");

    if (savedTimezone) {
      setTimezone(savedTimezone);
    }
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    setTimezone(value);
    localStorage.setItem("f1-timezone", value);

    const actualTimezone =
      value === "device"
        ? getDeviceTimezone()
        : value === "race"
          ? raceTimezone ?? getDeviceTimezone()
          : value;

    onTimezoneChange?.(actualTimezone);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-400">
        Time:
      </span>

      <select
        value={timezone}
        onChange={handleChange}
        className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
      >
        {TIMEZONES.map((zone) => (
          <option
            key={zone.value}
            value={zone.value}
          >
            {zone.label}
          </option>
        ))}
      </select>
    </div>
  );
}
