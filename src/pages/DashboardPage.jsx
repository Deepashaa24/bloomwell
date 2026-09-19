import { useState, useEffect } from 'react';
import { format, startOfToday, addDays, differenceInDays, eachDayOfInterval } from 'date-fns';
import LogModal from '../components/LogModal';
import PeriodModal from '../components/PeriodModal';
import SymptomSolutions from '../components/SymptomSolutions';
import { aiAPI, feedbackAPI, logsAPI, periodsAPI, settingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowLeft, ArrowRight, Droplets, Flame, HeartPulse, Moon, Plus, Sprout, Egg } from 'lucide-react';
import { toast } from 'sonner';
import RecommendationCard, { RecommendationSkeleton } from '../components/ai/RecommendationCard';
import CycleWheel from '../components/CycleWheel';
import { useFeature } from '../context/FeatureContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const hasRecommendations = useFeature('ai_recommendations');
  const [todayLog, setTodayLog] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [settings, setSettings] = useState({ cycleLength: 28, periodLength: 5 });
  const [showLogModal, setShowLogModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [defaultLogTab, setDefaultLogTab] = useState('Overview');
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(null);
  const [digestLoading, setDigestLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const today = startOfToday();

  useEffect(() => {
    fetchData();
  }, [hasRecommendations]);

  const fetchData = async () => {
    try {
      setLoading(true);

      try {
        const logResponse = await logsAPI.getLog(format(today, 'yyyy-MM-dd'));
        setTodayLog(logResponse.data.log);
      } catch (error) {
        setTodayLog(null);
      }

      const periodsResponse = await periodsAPI.getPeriods();
      setPeriods(periodsResponse.data.periods);

      const settingsResponse = await settingsAPI.getSettings();
      setSettings(settingsResponse.data.settings);

      if (hasRecommendations) {
        await loadRecommendations();
        await loadWeeklyDigest();
      }

      if (periodsResponse.data.periods.length > 0) {
        calculatePrediction(periodsResponse.data.periods, settingsResponse.data.settings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyDigest = async () => {
    try {
      setDigestLoading(true);
      const response = await aiAPI.getWeeklyDigest();
      setWeeklyDigest(response.data.digest);
    } catch (error) {
      setWeeklyDigest(null);
    } finally {
      setDigestLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      const response = await aiAPI.getRecommendations();
      const current = response.data.recommendations || [];
      const stale = !current.length || Date.now() - new Date(current[0].createdAt).getTime() > 24 * 60 * 60 * 1000;
      if (stale) {
        const generated = await aiAPI.generateRecommendations();
        setRecommendations(generated.data.recommendations || current);
      } else {
        setRecommendations(current);
      }
    } catch (error) {
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const dismissRecommendation = async (id) => {
    setRecommendations((current) => current.filter((recommendation) => recommendation._id !== id));
    try { await aiAPI.dismissRecommendation(id); } catch (error) { loadRecommendations(); }
  };

  const rateRecommendation = async (recommendation, sentiment) => {
    try { await feedbackAPI.submit({ category: 'general', message: `Recommendation rating: ${sentiment}`, context: { type: 'recommendation', recommendation: recommendation.content, sentiment } }); toast.success('Thanks for your feedback'); } catch (error) { toast.error('Could not save your feedback'); }
  };

  const calculatePrediction = (periodsData, userSettings) => {
    if (periodsData.length === 0) return;

    const sortedPeriods = [...periodsData].sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );
    const lastPeriod = sortedPeriods[0];
    const lastStartDate = new Date(lastPeriod.startDate);

    const nextPeriodDate = addDays(lastStartDate, userSettings.cycleLength);
    const daysUntilNextPeriod = differenceInDays(nextPeriodDate, today);

    const currentCycleDay = differenceInDays(today, lastStartDate) + 1;

    const ovulationDay = Math.floor(userSettings.cycleLength / 2);
    const fertileStart = ovulationDay - 2;
    const fertileEnd = ovulationDay + 2;
    const isInFertileWindow = currentCycleDay >= fertileStart && currentCycleDay <= fertileEnd;

    // Luteal phase calculation (typically 14 days after ovulation until next period)
    const lutealPhaseStart = ovulationDay + 1;
    const lutealPhaseEnd = userSettings.cycleLength;
    const isInLutealPhase = currentCycleDay >= lutealPhaseStart && currentCycleDay <= lutealPhaseEnd;
    
    // Determine current phase
    let currentPhase = '';
    if (currentCycleDay <= userSettings.periodLength) {
      currentPhase = 'Menstrual';
    } else if (currentCycleDay <= ovulationDay - 3) {
      currentPhase = 'Follicular';
    } else if (currentCycleDay >= fertileStart && currentCycleDay <= fertileEnd) {
      currentPhase = 'Ovulation';
    } else if (isInLutealPhase) {
      currentPhase = 'Luteal';
    }

    setPrediction({
      nextPeriodDate,
      daysUntilNextPeriod,
      currentCycleDay,
      isInFertileWindow,
      isInLutealPhase,
      currentPhase,
      cycleLength: userSettings.cycleLength,
      ovulationDay,
    });
  };

  const handleSaveLog = async (data) => {
    try {
      await logsAPI.saveLog(data);
      setShowLogModal(false);
      toast.success('Daily log saved');
      fetchData();
    } catch (error) {
      console.error('Error saving log:', error);
      toast.error('Failed to save log. Please try again.');
    }
  };

  const handleSavePeriod = async (startDate, endDate) => {
    try {
      await periodsAPI.addPeriod(startDate, endDate);
      setShowPeriodModal(false);
      toast.success('Period dates updated');
      fetchData();
    } catch (error) {
      console.error('Error saving period:', error);
      toast.error('Failed to save period. Please try again.');
    }
  };

  const handleWheelDaySelect = async (date) => {
    setSelectedDate(date);
    setDefaultLogTab(isPeriodDate(date) ? 'Cycle' : 'Overview');
    try {
      const response = await logsAPI.getLog(format(date, 'yyyy-MM-dd'));
      setSelectedLog(response.data.log);
    } catch (error) {
      setSelectedLog(null);
    }
    setShowLogModal(true);
  };

  const isPeriodDate = (date) => periods.some((period) => {
    const start = new Date(period.startDate);
    const end = period.endDate ? new Date(period.endDate) : addDays(start, settings.periodLength - 1);
    return date >= start && date <= end;
  });

  const renderCycleCircle = () => {
    // Show default circle even without prediction
    const cycleLength = prediction?.cycleLength || settings.cycleLength || 28;
    const currentCycleDay = prediction?.currentCycleDay || 1;
    const daysUntilNextPeriod = prediction?.daysUntilNextPeriod || 0;
    const isInFertileWindow = prediction?.isInFertileWindow || false;
    
    // Color scheme for different phases matching the image
    const getSegmentColor = (day) => {
      const periodDays = settings.periodLength || 5;
      const ovulationDay = Math.floor(cycleLength / 2);
      const fertileStart = ovulationDay - 2;
      const fertileEnd = ovulationDay + 2;
      
      if (day <= periodDays) return '#800020';
      if (day >= fertileStart && day <= fertileEnd) return '#800020';
      if (day > fertileEnd && day <= fertileEnd + 5) return '#800020';
      return '#800020';
    };

    const radius = 110;
    const centerX = 140;
    const centerY = 140;
    const segmentAngle = 360 / cycleLength;

    // Create circular segments with numbers
    const segments = [];
    const numbers = [];
    
    for (let i = 0; i < cycleLength; i++) {
      const day = i + 1;
      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArc = segmentAngle > 180 ? 1 : 0;
      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      const color = getSegmentColor(day);
      const opacity = day <= currentCycleDay ? 1 : 0.3;
      
      segments.push(
        <path
          key={`segment-${i}`}
          d={pathData}
          fill={color}
          opacity={opacity}
          stroke="white"
          strokeWidth="1"
        />
      );
      
      // Add day numbers around the circle
      const numberAngle = (i * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
      const numberRadius = radius + 20;
      const numX = centerX + numberRadius * Math.cos(numberAngle);
      const numY = centerY + numberRadius * Math.sin(numberAngle);
      
      numbers.push(
        <text
          key={`num-${i}`}
          x={numX}
          y={numY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={day <= currentCycleDay ? color : '#CCC'}
          fontSize="10"
          fontWeight={day === currentCycleDay ? 'bold' : 'normal'}
        >
          {day}
        </text>
      );
    }

    return (
      <div className="relative w-80 h-80 mx-auto">
        <svg className="w-80 h-80" viewBox="0 0 280 280">
          {segments}
          {numbers}
          
          {/* White center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r="70"
            fill="white"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-5xl font-bold text-gray-800">{daysUntilNextPeriod >= 0 ? daysUntilNextPeriod : 0}</p>
          <p className="text-sm text-gray-400 mt-1">Days until</p>
          <p className="text-lg font-semibold text-blue-500">next period</p>
          {isInFertileWindow && (
            <p className="text-xs text-blue-600 mt-2">Low chances of getting pregnant</p>
          )}
        </div>
      </div>
    );
  };

  const getDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 6; i++) {
      const day = addDays(today, i - 2);
      const isToday = differenceInDays(day, today) === 0;
      days.push({ date: day, isToday });
    }
    return days;
  };

  const getDaysInMonth = () => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = differenceInDays(date, today) === 0;
      const isPeriodDay = periods.some(period => {
        const start = new Date(period.startDate);
        const end = period.endDate ? new Date(period.endDate) : addDays(start, settings.periodLength - 1);
        return date >= start && date <= end;
      });
      
      days.push({ date, day, isToday, isPeriodDay });
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-50">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50 to-blue-50 relative overflow-hidden">

      {/* Decorative Blood Droplets */}
      <div className="absolute top-20 left-10 opacity-15 animate-pulse">
        <svg className="w-20 h-28 text-blue-300" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      <div className="absolute top-1/3 right-16 opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}>
        <svg className="w-16 h-24 text-blue-400" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      <div className="absolute bottom-32 left-1/4 opacity-15">
        <svg className="w-14 h-20 text-blue-300" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      {/* Decorative Flowers */}
      <div className="absolute top-1/2 right-20 opacity-15">
        <svg className="w-24 h-24 text-blue-200" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="8" />
          <ellipse cx="50" cy="30" rx="6" ry="12" />
          <ellipse cx="70" cy="50" rx="6" ry="12" transform="rotate(90 50 50)" />
          <ellipse cx="50" cy="70" rx="6" ry="12" />
          <ellipse cx="30" cy="50" rx="6" ry="12" transform="rotate(90 50 50)" />
        </svg>
      </div>

      {/* Heart shapes */}
      <div className="absolute bottom-1/4 right-1/3 opacity-10">
        <svg className="w-16 h-16 text-blue-300" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50,85 C50,85 20,60 20,40 C20,25 30,20 40,20 C45,20 50,25 50,25 C50,25 55,20 60,20 C70,20 80,25 80,40 C80,60 50,85 50,85 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl relative z-10">
        {/* Header with Greeting */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Hello, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h2>
          <p className="text-blue-500 font-semibold text-base sm:text-lg mt-1">A gentle read on your rhythm</p>
        </div>

        {/* Week Days Selector - matching the image */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 bg-[#fff5f5] rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-md">
          <button className="text-blue-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </button>
          
          <div className="flex gap-1 sm:gap-2">
            {getDaysOfWeek().map((day, idx) => (
              <button
                key={idx}
                className={`flex flex-col items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl transition-all ${
                  day.isToday
                    ? 'bg-blue-500 text-[#fff5f5] shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-[10px] sm:text-xs font-medium">{format(day.date, 'EEE')}</span>
                <span className="text-sm sm:text-lg font-bold mt-0.5">{format(day.date, 'd')}</span>
              </button>
            ))}
          </div>

          <button className="text-blue-500 hover:text-blue-600 transition-colors">
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </button>
        </div>

        <p className="text-center text-gray-500 font-medium text-sm sm:text-base mb-4 sm:mb-8">{format(today, 'MMMM, yyyy')}</p>

        <CycleWheel prediction={prediction} settings={settings} cycleStartDate={periods.length ? [...periods].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).at(-1)?.startDate : today} onDaySelect={handleWheelDaySelect} />

        <section aria-labelledby="quick-overview-heading" className="my-4 rounded-2xl border border-blue-100 bg-[#fff5f5]/80 p-4 shadow-sm dark:border-navy-700 dark:bg-navy-900/80 sm:my-6"><h2 id="quick-overview-heading" className="mb-3 text-xs font-bold   text-[var(--color-muted)]">Quick overview - today</h2><div className="flex flex-wrap gap-2">{(Array.isArray(todayLog?.mood) ? todayLog.mood : [todayLog?.mood]).filter(Boolean).map((mood) => <span key={mood} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold capitalize text-blue-700 dark:bg-navy-700 dark:text-blue-100">Mood: {mood}</span>)}{todayLog?.sexActivity?.filter((item) => item !== 'none').map((item) => <span key={item} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold capitalize text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">Intimacy: {item.replace('_', ' ')}</span>)}{todayLog?.sleepHours > 0 && <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">Rest: {todayLog.sleepHours}h</span>}{todayLog?.symptoms?.map((symptom) => <span key={symptom} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">{symptom}</span>)}{!todayLog && <span className="text-sm text-[var(--color-muted)]">No check-in yet. Tap a day to add one.</span>}</div></section>

        <section className="mb-4 rounded-2xl border border-navy-700 bg-navy-900 p-5 text-blue-50 shadow-soft sm:mb-8" aria-labelledby="weekly-digest-heading">{digestLoading ? <div className="animate-pulse space-y-3"><div className="h-3 w-28 rounded bg-[#fff5f5]/20" /><div className="h-5 w-2/3 rounded bg-[#fff5f5]/20" /><div className="h-3 w-full rounded bg-[#fff5f5]/20" /></div> : weeklyDigest ? <><p className="text-xs font-bold   text-blue-300">Your week in review</p><h2 id="weekly-digest-heading" className="mt-1 font-display text-2xl font-semibold">{weeklyDigest.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80">{weeklyDigest.blurb}</p></> : <p className="text-sm text-blue-100/80">Your weekly review will appear after you have a few daily check-ins.</p>}</section>

        {hasRecommendations && <section aria-labelledby="recommendations-heading" className="mb-4 sm:mb-8">
          <div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold   text-blue-500">Small steps, made personal</p><h2 id="recommendations-heading" className="font-display text-2xl font-semibold text-gray-800">Recommended for you</h2></div>{recommendations.length > 0 && <span className="text-xs text-gray-500">Based on your recent logs</span>}</div>
          <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-3">
            {recommendationsLoading ? <><RecommendationSkeleton /><RecommendationSkeleton /></> : recommendations.length > 0 ? recommendations.map((recommendation) => <RecommendationCard key={recommendation._id} recommendation={recommendation} onDismiss={dismissRecommendation} onRate={rateRecommendation} />) : <div className="app-surface w-full p-5 text-sm text-gray-500">Keep logging how you feel and we’ll tailor gentle suggestions here.</div>}
          </div>
        </section>}

        {/* Bottom Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl sm:rounded-3xl p-3 sm:p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <Flame className="mx-auto mb-1 h-6 w-6 text-blue-500 sm:mb-2 sm:h-8 sm:w-8" aria-hidden="true" />
            <p className="text-lg sm:text-2xl font-bold text-gray-800">{todayLog?.steps || 0}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 font-medium">Steps</p>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl sm:rounded-3xl p-3 sm:p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <Droplets className="mx-auto mb-1 h-6 w-6 text-blue-500 sm:mb-2 sm:h-8 sm:w-8" aria-hidden="true" />
            <p className="text-lg sm:text-2xl font-bold text-gray-800">{prediction?.currentCycleDay || 0}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 font-medium">Cycle Day</p>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl sm:rounded-3xl p-3 sm:p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <Activity className="mx-auto mb-1 h-6 w-6 text-blue-500 sm:mb-2 sm:h-8 sm:w-8" aria-hidden="true" />
            <p className="text-lg sm:text-2xl font-bold text-gray-800">{todayLog?.calories || 0}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 font-medium">Calories</p>
          </div>
        </div>

        {/* Current Phase Indicator */}
        {prediction && prediction.currentPhase && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 via-blue-50 to-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Current Phase</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{prediction.currentPhase} Phase</h3>
              </div>
              <div className="text-3xl sm:text-4xl" aria-hidden="true">
                {prediction.currentPhase === 'Menstrual' && <HeartPulse />}
                {prediction.currentPhase === 'Follicular' && <Sprout />}
                {prediction.currentPhase === 'Ovulation' && <Egg />}
                {prediction.currentPhase === 'Luteal' && <Moon />}
              </div>
            </div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-700 bg-[#fff5f5]/60 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              {prediction.currentPhase === 'Menstrual' && (
                <p>Your period has started. Focus on rest, hydration, and self-care. 💕</p>
              )}
              {prediction.currentPhase === 'Follicular' && (
                <p>Energy levels are rising! Great time for new activities and social events. ✨</p>
              )}
              {prediction.currentPhase === 'Ovulation' && (
                <p>Peak fertility window. Your body is at its strongest. Perfect for exercise! 💪</p>
              )}
              {prediction.currentPhase === 'Luteal' && (
                <p>Progesterone rises in this phase. You may feel more relaxed. Great time for introspection and gentle activities. 🧘‍♀️</p>
              )}
            </div>
          </div>
        )}

        {/* Log Your Symptoms Button */}
        <button
          onClick={() => setShowLogModal(true)}
          className="w-full bg-[#fff5f5] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
            <span className="text-gray-700 font-semibold text-base sm:text-lg">Log your symptoms</span>
          </div>
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Today's Mood & Symptoms */}
        {todayLog && (todayLog.mood || todayLog.symptoms?.length > 0) && (
          <div className="mt-4 sm:mt-6 bg-[#fff5f5] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md">
            <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
              <span className="text-lg sm:text-xl">📝</span>
              Today's Notes
            </h3>
            {todayLog.mood && (
              <div className="mb-3">
                <p className="text-sm text-gray-500 mb-1 font-medium">Mood</p>
                <p className="text-lg font-medium">{Array.isArray(todayLog.mood) ? todayLog.mood.join(' · ') : todayLog.mood}</p>
              </div>
            )}
            {todayLog.symptoms && todayLog.symptoms.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {todayLog.symptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Symptom Solutions */}
        {todayLog && todayLog.symptoms && todayLog.symptoms.length > 0 && (
          <SymptomSolutions symptoms={todayLog.symptoms} />
        )}
      </div>

      <LogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        date={selectedDate || today}
        onSave={handleSaveLog}
        initialData={selectedDate ? selectedLog : todayLog}
        isPeriodDay={isPeriodDate(selectedDate || today)}
        defaultTab={defaultLogTab}
        onDateChange={handleWheelDaySelect}
      />

      <PeriodModal
        isOpen={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        onSave={handleSavePeriod}
      />
    </div>
  );
};

export default DashboardPage;
