import { useEffect, useState } from 'react';
import { addDays, differenceInDays, format, startOfToday } from 'date-fns';
import { CalendarDays, CheckCircle2, Egg, Heart, Info, Moon, Plus, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import CycleWheel from '../components/CycleWheel';
import FertilitySignsModal from '../components/FertilitySignsModal';
import PeriodModal from '../components/PeriodModal';
import RecommendationCard, { RecommendationSkeleton } from '../components/ai/RecommendationCard';
import { useAuth } from '../context/AuthContext';
import { useFeature } from '../context/FeatureContext';
import { aiAPI, logsAPI, periodsAPI, settingsAPI } from '../services/api';

const phaseGuidance = {
  Menstrual: 'A new cycle is beginning. Rest, replenish, and note any signs that help you understand your baseline.',
  Follicular: 'Estrogen is building. Watch for cervical fluid becoming wetter or more slippery as your fertile days approach.',
  Ovulation: 'This is your most fertile stretch. Consider intimacy every day or every other day while these signs are present.',
  Luteal: 'The fertile window has likely passed. Keep logging signs and give yourself space while you wait for your next cycle.',
};

const TryingToConceivePage = () => {
  const { user } = useAuth();
  const hasRecommendations = useFeature('ai_recommendations');
  const today = startOfToday();
  const [todayLog, setTodayLog] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [settings, setSettings] = useState({ cycleLength: 28, periodLength: 5 });
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadData();
  }, [hasRecommendations]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [periodResponse, settingsResponse, logResponse] = await Promise.all([
        periodsAPI.getPeriods(),
        settingsAPI.getSettings(),
        logsAPI.getLog(format(today, 'yyyy-MM-dd')).catch(() => ({ data: { log: null } })),
      ]);
      const nextPeriods = periodResponse.data.periods || [];
      const nextSettings = { ...settings, ...settingsResponse.data.settings };
      setPeriods(nextPeriods);
      setSettings(nextSettings);
      setTodayLog(logResponse.data.log);
      setPrediction(calculatePrediction(nextPeriods, nextSettings));
      if (hasRecommendations) await loadRecommendations();
      else setRecommendationsLoading(false);
    } catch (error) {
      console.error('Error fetching conception dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrediction = (periodsData, userSettings) => {
    if (!periodsData.length) return null;
    const cycleLength = Number(userSettings.cycleLength) || 28;
    const periodLength = Number(userSettings.periodLength) || 5;
    const lastPeriod = [...periodsData].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
    const lastStartDate = new Date(lastPeriod.startDate);
    const nextPeriodDate = addDays(lastStartDate, cycleLength);
    const currentCycleDay = differenceInDays(today, lastStartDate) + 1;
    const ovulationDay = Math.floor(cycleLength / 2);
    const fertileStart = ovulationDay - 2;
    const fertileEnd = ovulationDay + 2;
    const isInFertileWindow = currentCycleDay >= fertileStart && currentCycleDay <= fertileEnd;
    let currentPhase = 'Luteal';
    if (currentCycleDay <= periodLength) currentPhase = 'Menstrual';
    else if (currentCycleDay <= ovulationDay - 3) currentPhase = 'Follicular';
    else if (isInFertileWindow) currentPhase = 'Ovulation';
    return {
      nextPeriodDate,
      daysUntilNextPeriod: differenceInDays(nextPeriodDate, today),
      currentCycleDay,
      daysToOvulation: Math.max(0, ovulationDay - currentCycleDay),
      isInFertileWindow,
      currentPhase,
      cycleLength,
      ovulationDay,
    };
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
      } else setRecommendations(current);
    } catch (error) {
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleSaveLog = async (data) => {
    try {
      await logsAPI.saveLog(data);
      setShowLogModal(false);
      toast.success('Fertility check-in saved');
      await loadData();
    } catch (error) {
      toast.error('Failed to save check-in. Please try again.');
    }
  };

  const handleSavePeriod = async (startDate, endDate) => {
    try {
      await periodsAPI.addPeriod(startDate, endDate);
      setShowPeriodModal(false);
      toast.success('Period dates updated');
      await loadData();
    } catch (error) {
      toast.error('Failed to save period. Please try again.');
    }
  };

  const handleDaySelect = async (date) => {
    setSelectedDate(date);
    try {
      const response = await logsAPI.getLog(format(date, 'yyyy-MM-dd'));
      setSelectedLog(response.data.log);
      if (date.toDateString() === today.toDateString()) setTodayLog(response.data.log);
    } catch (error) {
      setSelectedLog(null);
      if (date.toDateString() === today.toDateString()) setTodayLog(null);
    }
    setShowLogModal(true);
  };

  const isPeriodDate = (date) => periods.some((period) => {
    const start = new Date(period.startDate);
    const end = period.endDate ? new Date(period.endDate) : addDays(start, Number(settings.periodLength || 5) - 1);
    return date >= start && date <= end;
  });

  const dismissRecommendation = async (id) => {
    setRecommendations((current) => current.filter((recommendation) => recommendation._id !== id));
    try {
      await aiAPI.dismissRecommendation(id);
    } catch (error) {
      loadRecommendations();
    }
  };

  const openTodayLog = () => {
    setSelectedDate(today);
    setSelectedLog(todayLog);
    setShowLogModal(true);
  };

  if (loading) return <TryingToConceiveSkeleton />;

  if (!periods.length) {
    return <div className="min-h-screen bg-[var(--color-canvas)] px-4 py-7 text-[var(--color-ink)] sm:px-8 md:px-12"><div className="mx-auto max-w-3xl"><header className="mb-8"><p className="mb-2 text-xs font-bold text-blue-500">Trying to conceive</p><h1 className="font-display text-4xl font-semibold">A clearer view of your fertile days</h1><p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">Start with your latest period so Bloomwell can map your cycle and help you notice conception-friendly signs.</p></header><div className="app-surface p-8 text-center sm:p-12"><CalendarDays className="mx-auto mb-4 text-blue-500" size={42} /><h2 className="font-display text-2xl font-semibold">Add your first period</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)]">Once you log a period, you’ll see your fertile window, estimated ovulation, and next period here.</p><button type="button" onClick={() => setShowPeriodModal(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-[#fff5f5]"><Plus size={18} /> Log a period</button></div></div><PeriodModal isOpen={showPeriodModal} onClose={() => setShowPeriodModal(false)} onSave={handleSavePeriod} /></div>;
  }

  const cycleStartDate = [...periods].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).at(-1)?.startDate;
  const signs = [
    prediction?.isInFertileWindow && 'Fertile window',
    todayLog?.discharge?.type && todayLog.discharge.type !== 'none' && `Discharge: ${todayLog.discharge.type}`,
    ...(Array.isArray(todayLog?.sexActivity) ? todayLog.sexActivity.map((item) => `Sex: ${item.replaceAll('_', ' ')}`) : []),
    ...(Array.isArray(todayLog?.symptoms) ? todayLog.symptoms : []),
    todayLog?.temperature > 0 && `Temperature: ${todayLog.temperature}°${todayLog.temperatureUnit || 'C'}`,
  ].filter(Boolean);
  const phaseIcon = { Menstrual: Heart, Follicular: Sprout, Ovulation: Egg, Luteal: Moon }[prediction.currentPhase] || Heart;
  const PhaseIcon = phaseIcon;
  const FertilityModal = FertilitySignsModal;

  return <div className="min-h-screen bg-[var(--color-canvas)] px-4 py-7 text-[var(--color-ink)] sm:px-8 md:px-12"><div className="mx-auto max-w-6xl"><header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold text-blue-500">Trying to conceive</p><h1 className="font-display text-4xl font-semibold">Hello, {user?.name?.split(' ')[0] || 'there'}</h1><p className="mt-2 text-sm text-[var(--color-muted)]">Understand your fertile signs, one day at a time.</p></div><button type="button" onClick={() => setShowPeriodModal(true)} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600"><Plus size={17} /> Log period</button></header><div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900"><Info className="mt-0.5 shrink-0" size={19} /><p>Cycle predictions are estimates. Ovulation can vary, so pair this view with your own signs and medical guidance.</p></div><section className="grid gap-5 lg:grid-cols-[1.05fr_1fr]"><CycleWheel prediction={prediction} settings={settings} cycleStartDate={cycleStartDate} onDaySelect={handleDaySelect} /><div className="space-y-5"><div className="grid grid-cols-2 gap-3"><Metric icon={Egg} label="Days to ovulation" value={prediction.daysToOvulation === 0 ? 'Today' : prediction.daysToOvulation} /><Metric icon={CalendarDays} label="Next period" value={`${Math.max(0, prediction.daysUntilNextPeriod)} days`} /></div><section className="app-surface p-5" aria-labelledby="phase-guidance-heading"><div className="flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-navy-700 dark:text-blue-100"><PhaseIcon size={20} /></div><div><p className="text-xs font-bold text-blue-500">{prediction.currentPhase} phase</p><h2 id="phase-guidance-heading" className="mt-1 font-display text-2xl font-semibold">Support your conception goals</h2><p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{phaseGuidance[prediction.currentPhase]}</p></div></div></section><section className="app-surface p-5" aria-labelledby="signs-heading"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-blue-500">Today’s check-in</p><h2 id="signs-heading" className="font-display text-2xl font-semibold">Fertility signs</h2></div><CheckCircle2 className="text-blue-500" size={22} /></div><div className="flex flex-wrap gap-2">{signs.length ? signs.map((sign) => <span key={sign} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold capitalize text-blue-700 dark:bg-navy-700 dark:text-blue-100">{sign}</span>) : <p className="text-sm text-[var(--color-muted)]">No fertility signs logged today yet.</p>}</div><button type="button" onClick={openTodayLog} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600"><Plus size={16} /> Add today’s signs</button></section></div></section>{hasRecommendations && <section className="mt-6" aria-labelledby="recommendations-heading"><div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold text-blue-500">Conception support</p><h2 id="recommendations-heading" className="font-display text-2xl font-semibold">Recommended for you</h2></div></div><div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-3">{recommendationsLoading ? <><RecommendationSkeleton /><RecommendationSkeleton /></> : recommendations.length ? recommendations.map((recommendation) => <RecommendationCard key={recommendation._id} recommendation={recommendation} onDismiss={dismissRecommendation} />) : <div className="app-surface w-full p-5 text-sm text-[var(--color-muted)]">Keep logging your signs and personalized conception guidance will appear here.</div>}</div></section>}</div><FertilityModal isOpen={showLogModal} onClose={() => setShowLogModal(false)} date={selectedDate} onSave={handleSaveLog} initialData={selectedDate.toDateString() === today.toDateString() ? todayLog : selectedLog} isPeriodDay={isPeriodDate(selectedDate)} defaultTab="Cycle" onDateChange={handleDaySelect} /><PeriodModal isOpen={showPeriodModal} onClose={() => setShowPeriodModal(false)} onSave={handleSavePeriod} /></div>;
};

const Metric = ({ icon: Icon, label, value }) => <div className="app-surface p-4"><Icon className="mb-3 text-blue-500" size={20} /><p className="text-xs font-semibold text-[var(--color-muted)]">{label}</p><p className="mt-1 font-display text-xl font-semibold">{value}</p></div>;
const TryingToConceiveSkeleton = () => <div className="min-h-screen bg-[var(--color-canvas)] p-8"><div className="mx-auto max-w-6xl animate-pulse space-y-5"><div className="h-10 w-64 rounded-xl bg-blue-100 dark:bg-navy-700" /><div className="h-16 rounded-2xl bg-blue-50 dark:bg-navy-900" /><div className="grid gap-5 lg:grid-cols-2"><div className="h-80 rounded-2xl bg-blue-50 dark:bg-navy-900" /><div className="h-80 rounded-2xl bg-blue-50 dark:bg-navy-900" /></div></div></div>;

export default TryingToConceivePage;
