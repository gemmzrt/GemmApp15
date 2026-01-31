import { toZonedTime, format } from 'date-fns-tz';
import { differenceInMinutes, addDays, set } from 'date-fns';
import { Segment } from '../types';

const EVENT_TZ = 'America/Argentina/Buenos_Aires';
// Fixed Event Date: 2026-03-14
const BASE_DATE_ISO = '2026-03-14';

export const getEventTimes = () => {
  const baseDate = new Date(BASE_DATE_ISO + 'T00:00:00'); // Local interpret, but we construct zoned below
  
  // Construct dates specifically in the target timezone
  const youngStart = toZonedTime(set(baseDate, { hours: 14, minutes: 0 }), EVENT_TZ);
  const adultStart = toZonedTime(set(baseDate, { hours: 19, minutes: 0 }), EVENT_TZ);
  const endEvent = toZonedTime(set(addDays(baseDate, 1), { hours: 1, minutes: 0 }), EVENT_TZ);
  
  return { youngStart, adultStart, endEvent };
};

export const getSegmentTargetTime = (segment: Segment | null) => {
  const { youngStart, adultStart } = getEventTimes();
  return segment === 'ADULT' ? adultStart : youngStart;
};

export const getCountdown = (targetDate: Date) => {
  const now = new Date(); // Browser local
  // date-fns handles comparison correctly if both are Date objects, regardless of TZ, as they are timestamps.
  
  const diffMinutes = differenceInMinutes(targetDate, now);
  
  if (diffMinutes <= 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const days = Math.floor(diffMinutes / (60 * 24));
  const hours = Math.floor((diffMinutes % (60 * 24)) / 60);
  const minutes = diffMinutes % 60;

  return { days, hours, minutes, isPast: false };
};

export const formatEventDate = (date: Date) => {
  return format(date, "EEEE d 'of' MMMM yyyy, HH:mm", { timeZone: EVENT_TZ });
};