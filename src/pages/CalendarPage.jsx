import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, addDays, differenceInDays, isSameMonth, isSameDay } from 'date-fns';
import { periodsAPI, settingsAPI } from '../services/api';
import { CalendarDays, ChevronLeft, ChevronRight, CircleDot, Droplet, Sparkles, Trash2 } from 'lucide-react';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [periods, setPeriods] = useState([]);
  const [settings, setSettings] = useState({ cycleLength: 28, periodLength: 5 });
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [predictedDates, setPredictedDates] = useState([]);
  const [fertileDates, setFertileDates] = useState([]);
  const [ovulationDates, setOvulationDates] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculatePredictions();
  }, [periods, settings]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [periodsRes, settingsRes] = await Promise.all([
        periodsAPI.getPeriods(),
        settingsAPI.getSettings(),
      ]);
      setPeriods(periodsRes.data.periods);
      setSettings(settingsRes.data.settings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePredictions = () => {
    if (periods.length === 0) return;

    const sortedPeriods = [...periods].sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );
    const lastPeriod = sortedPeriods[0];
    const lastStartDate = new Date(lastPeriod.startDate);

    // Predict next 3 cycles
    const predicted = [];
    const fertile = [];
    const ovulation = [];

    for (let i = 1; i <= 3; i++) {
      const nextStart = addDays(lastStartDate, settings.cycleLength * i);
      
      // Add predicted period dates
      for (let j = 0; j < settings.periodLength; j++) {
        predicted.push(addDays(nextStart, j));
      }

      // Add fertile window (5 days around ovulation)
      const ovulationDay = Math.floor(settings.cycleLength / 2);
      ovulation.push(addDays(lastStartDate, settings.cycleLength * i + ovulationDay));
      for (let j = ovulationDay - 2; j <= ovulationDay + 2; j++) {
        const fertileDate = addDays(lastStartDate, settings.cycleLength * i + j);
        fertile.push(fertileDate);
      }
    }

    setPredictedDates(predicted);
    setFertileDates(fertile);
    setOvulationDates(ovulation);
  };

  const handleAddPeriod = async (e) => {
    e.preventDefault();
    try {
      await periodsAPI.addPeriod(startDate, endDate);
      setShowAddPeriod(false);
      setStartDate('');
      setEndDate('');
      fetchData();
    } catch (error) {
      console.error('Error adding period:', error);
      alert('Failed to add period. Please check the dates and try again.');
    }
  };

  const handleDateClick = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!startDate) {
      setStartDate(dateStr);
      setShowAddPeriod(true);
    } else if (!endDate) {
      setEndDate(dateStr);
    }
  };

  const handleDeletePeriodDate = async (date, e) => {
    e.stopPropagation();
    
    // Find the period that contains this date
    const periodToDelete = periods.find(period => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      return date >= start && date <= end;
    });

    if (periodToDelete) {
      if (confirm('Delete this period entry?')) {
        try {
          await periodsAPI.deletePeriod(periodToDelete._id);
          fetchData();
        } catch (error) {
          console.error('Error deleting period:', error);
          alert('Failed to delete period. Please try again.');
        }
      }
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const isPeriodDay = (date) => {
    return periods.some(period => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      return date >= start && date <= end;
    });
  };

  const isPredictedDay = (date) => {
    return predictedDates.some(d => isSameDay(d, date));
  };

  const isFertileDay = (date) => {
    return fertileDates.some(d => isSameDay(d, date));
  };

  const isOvulationDay = (date) => ovulationDates.some((day) => isSameDay(day, date));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 relative overflow-hidden">

      {/* Decorative Elements - Blood Droplets */}
      <div className="absolute top-10 left-10 opacity-20 animate-pulse">
        <svg className="w-24 h-32 text-blue-300" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      <div className="absolute top-40 right-16 opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}>
        <svg className="w-20 h-28 text-blue-400" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      <div className="absolute bottom-32 left-32 opacity-20">
        <svg className="w-16 h-24 text-blue-300" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>
      
      {/* Decorative Flowers */}
      <div className="absolute top-20 right-1/4 opacity-20">
        <svg className="w-32 h-32 text-blue-300" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="10" />
          <ellipse cx="50" cy="25" rx="8" ry="15" transform="rotate(0 50 50)" />
          <ellipse cx="75" cy="50" rx="8" ry="15" transform="rotate(90 50 50)" />
          <ellipse cx="50" cy="75" rx="8" ry="15" transform="rotate(0 50 50)" />
          <ellipse cx="25" cy="50" rx="8" ry="15" transform="rotate(90 50 50)" />
        </svg>
      </div>

      {/* Decorative Leaves */}
      <div className="absolute bottom-20 right-20 opacity-15">
        <svg className="w-40 h-40 text-blue-300" viewBox="0 0 100 100" fill="currentColor">
          <path d="M20,50 Q30,30 50,30 Q30,50 20,50 Z" />
          <path d="M50,30 Q70,30 80,50 Q70,50 50,30 Z" />
          <path d="M50,70 Q30,70 20,50 Q30,50 50,70 Z" />
          <path d="M80,50 Q70,70 50,70 Q70,50 80,50 Z" />
        </svg>
      </div>

      {/* Decorative Pills/Medicine */}
      <div className="absolute top-1/3 right-10 opacity-20">
        <svg className="w-28 h-16 text-blue-400" viewBox="0 0 100 50" fill="currentColor">
          <rect x="10" y="10" width="35" height="30" rx="15" />
          <rect x="55" y="10" width="35" height="30" rx="15" />
          <line x1="27.5" y1="10" x2="27.5" y2="40" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* Decorative Cup */}
      <div className="absolute bottom-40 right-1/3 opacity-15">
        <svg className="w-28 h-32 text-blue-300" viewBox="0 0 100 120" fill="currentColor">
          <path d="M30,20 L70,20 L65,80 Q65,95 50,95 Q35,95 35,80 Z" />
          <ellipse cx="50" cy="20" rx="20" ry="5" />
          <line x1="30" y1="35" x2="70" y2="35" stroke="white" strokeWidth="2" opacity="0.5" />
        </svg>
      </div>

      {/* Decorative Pad/Tampon */}
      <div className="absolute top-1/2 left-16 opacity-15 rotate-12">
        <svg className="w-24 h-32 text-blue-200" viewBox="0 0 80 120" fill="currentColor">
          <rect x="20" y="10" width="40" height="80" rx="8" />
          <rect x="25" y="15" width="30" height="70" rx="5" fill="white" opacity="0.3" />
          <ellipse cx="40" cy="95" rx="15" ry="8" />
        </svg>
      </div>

      {/* Small scatteblue droplets */}
      <div className="absolute top-60 left-1/3 opacity-10">
        <svg className="w-8 h-12 text-blue-400" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      <div className="absolute bottom-60 right-1/4 opacity-10">
        <svg className="w-10 h-14 text-blue-400" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      <div className="absolute top-1/4 right-1/3 opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>
        <svg className="w-6 h-10 text-blue-300" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      {/* Heart shapes */}
      <div className="absolute bottom-1/4 left-1/4 opacity-15">
        <svg className="w-16 h-16 text-blue-300" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50,85 C50,85 20,60 20,40 C20,25 30,20 40,20 C45,20 50,25 50,25 C50,25 55,20 60,20 C70,20 80,25 80,40 C80,60 50,85 50,85 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-blue-400 mb-2" style={{ fontFamily: 'cursive' }}>
            MENSTRUAL CALENDAR
          </h2>
          <p className="text-gray-600">Track your cycle beautifully</p>
        </div>

        {/* Main Calendar Card */}
        <div className="bg-[#fff5f5]/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handlePreviousMonth}
              className="p-2 rounded-full hover:bg-blue-100 transition-colors"
            >
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-2xl font-bold text-gray-700">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-blue-100 transition-colors"
            >
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isPeriod = isPeriodDay(day);
              const isPredicted = isPredictedDay(day);
              const isFertile = isFertileDay(day);

              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square rounded-2xl p-2 text-center transition-all relative group
                    ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                    ${isToday ? 'ring-2 ring-blue-400 font-bold' : ''}
                    ${isPeriod ? 'text-[#fff5f5] font-semibold' : ''}
                    ${!isPeriod && isPredicted ? 'text-blue-700' : ''}
                    ${!isPeriod && !isPredicted && isOvulationDay(day) ? 'text-blue-700' : ''}
                    ${!isPeriod && !isPredicted && !isOvulationDay(day) && isFertile ? 'text-blue-700' : ''}
                    ${!isPeriod && !isPredicted && !isOvulationDay(day) && !isFertile ? 'hover:bg-gray-100' : ''}
                  `}
                >
                  <span className={`relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full ${isPeriod ? 'bg-blue-400' : isPredicted ? 'bg-blue-100' : isOvulationDay(day) ? 'bg-blue-100' : isFertile ? 'bg-blue-100' : 'bg-transparent'}`}>{format(day, 'd')}</span>
                  {isToday && <span className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-blue-500" aria-label="Today" />}
                  {isPeriod && (
                    <>
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                        <Droplet size={11} className="fill-white text-[#fff5f5]" aria-hidden="true" />
                      </div>
                      <button
                        onClick={(e) => handleDeletePeriodDate(day, e)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-[#fff5f5]/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fff5f5] hover:scale-110"
                        title="Delete this period"
                      >
                        <Trash2 size={11} className="text-blue-500" />
                      </button>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-blue-400"></div>
              <span className="text-gray-600">Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-blue-100"></div>
              <span className="text-gray-600">Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-blue-100"></div>
              <span className="text-gray-600">Fertile window</span>
            </div>
            <div className="flex items-center gap-2"><div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100"><CircleDot size={11} className="text-blue-600" /></div><span className="text-gray-600">Ovulation</span></div>
          </div>

          {/* Phase Information */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 via-blue-50 to-blue-50 rounded-2xl p-4">
            <h4 className="font-bold text-gray-800 mb-3 text-center">Menstrual Cycle Phases</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#fff5f5]/80 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🩸</span>
                  <span className="font-bold text-blue-600">Menstrual</span>
                </div>
                <p className="text-gray-600">Days 1-5: Period starts, hormone levels low</p>
              </div>
              <div className="bg-[#fff5f5]/80 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🌱</span>
                  <span className="font-bold text-blue-600">Follicular</span>
                </div>
                <p className="text-gray-600">Days 6-13: Energy rises, estrogen increases</p>
              </div>
              <div className="bg-[#fff5f5]/80 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🥚</span>
                  <span className="font-bold text-blue-600">Ovulation</span>
                </div>
                <p className="text-gray-600">Days 14-16: Most fertile, egg released</p>
              </div>
              <div className="bg-[#fff5f5]/80 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🌙</span>
                  <span className="font-bold text-blue-600">Luteal</span>
                </div>
                <p className="text-gray-600">Days 17-28: Progesterone peaks, PMS may occur</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Period Button */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowAddPeriod(!showAddPeriod)}
            className="bg-gradient-to-r from-blue-400 to-blue-500 text-[#fff5f5] px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {showAddPeriod ? '✕ Cancel' : '➕ Add Period'}
          </button>
        </div>

        {/* Add Period Form */}
        {showAddPeriod && (
          <div className="bg-[#fff5f5]/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add Period Entry</h3>
            <form onSubmit={handleAddPeriod} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-[#fff5f5] py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                💾 Save Period
              </button>
            </form>
          </div>
        )}

        {/* Period History */}
        <div className="bg-[#fff5f5]/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Period History
          </h3>
          {periods.length > 0 ? (
            <div className="space-y-3">
              {periods.slice(0, 10).map((period) => (
                <div
                  key={period._id}
                  className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {format(new Date(period.startDate), 'MMM dd, yyyy')} - {format(new Date(period.endDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duration: {differenceInDays(new Date(period.endDate), new Date(period.startDate)) + 1} days 💧
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm('Delete this period entry?')) {
                        try {
                          await periodsAPI.deletePeriod(period._id);
                          fetchData();
                        } catch (error) {
                          console.error('Error deleting period:', error);
                        }
                      }
                    }}
                    className="text-blue-400 hover:text-blue-600 hover:scale-110 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No period entries yet. Add your first period above! 🌸</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
