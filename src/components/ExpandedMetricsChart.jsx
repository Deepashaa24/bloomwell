import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';

const ExpandedMetricsChart = ({ data }) => {
  const metrics = data.map((log) => ({ date: format(new Date(log.date), 'MMM d'), sleep: Number(log.sleepHours) || 0, water: Number(log.waterIntake) || 0 }));
  const dischargeCounts = data.reduce((result, log) => {
    const type = log.discharge?.type || 'none';
    result[type] = result[type] || { discharge: type, symptomDays: 0, days: 0 };
    result[type].days += 1;
    if ((log.symptoms?.length || 0) + (log.pain?.length || 0) > 0) result[type].symptomDays += 1;
    return result;
  }, {});
  const correlation = Object.values(dischargeCounts).filter((item) => item.discharge !== 'none' && item.days >= 2).map((item) => ({ ...item, symptomRate: Math.round((item.symptomDays / item.days) * 100) }));
  const hasSleepOrWater = data.some((log) => log.sleepHours > 0 || log.waterIntake > 0);
  if (!hasSleepOrWater && correlation.length < 2) return null;

  return <div className="space-y-8"><div className="rounded-lg bg-[#fff5f5] p-6 shadow"><h3 className="mb-4 text-lg font-semibold text-gray-800">Sleep and hydration trends</h3>{hasSleepOrWater ? <ResponsiveContainer width="100%" height={280}><LineChart data={metrics}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="sleep" stroke="#800020" strokeWidth={2} name="Sleep (hours)" /><Line type="monotone" dataKey="water" stroke="#800020" strokeWidth={2} name="Water (glasses)" /></LineChart></ResponsiveContainer> : <p className="py-8 text-center text-gray-500">Log sleep or water intake to see a trend.</p>}</div>{correlation.length >= 2 && <div className="rounded-lg bg-[#fff5f5] p-6 shadow"><h3 className="mb-1 text-lg font-semibold text-gray-800">Discharge and symptom correlation</h3><p className="mb-4 text-xs text-gray-500">Percentage of days with a symptom logged for each discharge type. This is an observation, not a medical finding.</p><ResponsiveContainer width="100%" height={260}><BarChart data={correlation}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="discharge" /><YAxis unit="%" /><Tooltip /><Bar dataKey="symptomRate" fill="#800020" name="Days with symptoms" /></BarChart></ResponsiveContainer></div>}</div>;
};

export default ExpandedMetricsChart;
