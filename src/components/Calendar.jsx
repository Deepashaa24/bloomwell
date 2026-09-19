import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';

const Calendar = ({ currentDate, periods, onDateClick, predictedDates, fertileDates }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const isPeriodDay = (day) => {
    return periods.some((period) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      return day >= start && day <= end;
    });
  };

  const isPredictedDay = (day) => {
    return predictedDates?.some((date) => isSameDay(new Date(date), day));
  };

  const isFertileDay = (day) => {
    return fertileDates?.some((date) => isSameDay(new Date(date), day));
  };

  const getDayClass = (day) => {
    const baseClass = 'h-12 w-12 flex items-center justify-center rounded-full cursor-pointer transition-colors';
    const notCurrentMonth = !isSameMonth(day, currentDate);
    
    if (notCurrentMonth) {
      return `${baseClass} text-gray-300`;
    }

    if (isPeriodDay(day)) {
      return `${baseClass} bg-blue-600 text-blue-100 hover:bg-navy-700`;
    }

    if (isPredictedDay(day)) {
      return `${baseClass} bg-blue-200 text-navy-900 hover:bg-blue-300`;
    }

    if (isFertileDay(day)) {
      return `${baseClass} bg-blue-100 text-navy-900 hover:bg-blue-200`;
    }

    if (isToday(day)) {
      return `${baseClass} border-2 border-primary-500 text-gray-800 hover:bg-gray-100`;
    }

    return `${baseClass} text-gray-700 hover:bg-gray-100`;
  };

  return (
    <div className="bg-[#fff5f5] rounded-lg shadow p-6">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="flex justify-center"
          >
            <button
              onClick={() => onDateClick(day)}
              className={getDayClass(day)}
            >
              {format(day, 'd')}
            </button>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-600"></div>
          <span>Period</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-200"></div>
          <span>Predicted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-100"></div>
          <span>Fertile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-primary-500"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
