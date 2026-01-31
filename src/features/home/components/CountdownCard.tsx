import React, { useEffect, useState } from 'react';
import { Segment } from '../../../types';
import { getCountdown, getSegmentTargetTime } from '../../../lib/time';

interface Props {
  segment: Segment | null;
}

export const CountdownCard: React.FC<Props> = ({ segment }) => {
  const targetDate = getSegmentTargetTime(segment);
  const [timeLeft, setTimeLeft] = useState(getCountdown(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getCountdown(targetDate));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [targetDate]);

  const { days, hours, minutes, isPast } = timeLeft;

  return (
    <div className="bg-brand-500 text-white rounded-2xl p-6 shadow-lg col-span-2 md:col-span-1">
      <h3 className="text-sm font-medium opacity-90 uppercase tracking-wider mb-2">Countdown</h3>
      {isPast ? (
        <div className="text-2xl font-bold">Party in progress! 🎉</div>
      ) : (
        <div className="flex justify-between items-center text-center">
          <div>
            <div className="text-3xl font-bold">{days}</div>
            <div className="text-xs uppercase opacity-80">Days</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{hours}</div>
            <div className="text-xs uppercase opacity-80">Hrs</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{minutes}</div>
            <div className="text-xs uppercase opacity-80">Mins</div>
          </div>
        </div>
      )}
      <div className="mt-4 text-xs opacity-75 text-center">
        Access: {segment === 'ADULT' ? '19:00' : '14:00'}
      </div>
    </div>
  );
};