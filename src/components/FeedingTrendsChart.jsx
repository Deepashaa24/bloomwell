import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const FeedingTrendsChart = ({ feeds = [] }) => {
  const data = Object.values(feeds.reduce((result, feed) => { const key = new Date(feed.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); result[key] ||= { date: key, amount: 0, duration: 0 }; result[key].amount += feed.amountMl || 0; result[key].duration += feed.durationMinutes || 0; return result; }, {})).slice(-30);
  return <section className="app-surface p-5"><div className="mb-4"><p className="text-xs font-bold   text-blue-600">Feeding rhythm</p><h2 className="font-display text-2xl font-semibold">Recent feeds</h2></div>{data.length ? <ResponsiveContainer width="100%" height={240}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#f7d6d0" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="amount" fill="#800020" name="Amount (ml)" radius={[6, 6, 0, 0]} /><Bar dataKey="duration" fill="#800020" name="Duration (min)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <p className="py-10 text-center text-sm text-[var(--color-muted)]">Log feeds to see a 7 or 30 day trend.</p>}</section>;
};

export default FeedingTrendsChart;
