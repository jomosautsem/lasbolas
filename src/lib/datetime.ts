import { format, toDate, zonedTimeToUtc, toZonedTime } from 'date-fns-tz';
import { subDays, set } from 'date-fns';
import type { Shift } from './types';

const TIMEZONE = 'America/Mexico_City';

export function getMexicoCityTime(date: Date = new Date()): Date {
  return toZonedTime(date, TIMEZONE);
}

export interface ShiftInfo {
  shift: Shift;
  operationalDate: Date;
}

export function getCurrentShiftInfo(date: Date = new Date()): ShiftInfo {
  const now = getMexicoCityTime(date);
  const hour = now.getHours();

  let shift: Shift;
  let operationalDate = now;

  if (hour >= 7 && hour < 14) {
    shift = 'Matutino';
  } else if (hour >= 14 && hour < 21) {
    shift = 'Vespertino';
  } else {
    shift = 'Nocturno';
    if (hour < 7) {
      // It's the morning part of the previous day's night shift
      operationalDate = subDays(now, 1);
    }
  }

  // Set time to 0 to only care about the date part
  return {
    shift,
    operationalDate: set(operationalDate, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
  };
}

export function formatToMexicanDate(date: Date | string | number): string {
    const d = toDate(date);
    const zonedDate = toZonedTime(d, TIMEZONE);
    return format(zonedDate, 'dd/MM/yyyy', { timeZone: TIMEZONE });
}

export function formatToMexicanTime(date: Date | string | number): string {
    const d = toDate(date);
    const zonedDate = toZonedTime(d, TIMEZONE);
    return format(zonedDate, 'HH:mm', { timeZone: TIMEZONE });
}
