import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const StepChart = ({ data }) => {
  const chartData = data.map((log) => ({
    date: format(new Date(log.date), 'MMM dd'),
    steps: log.steps,
    calories: log.calories,
  }));

  return (
    <div className="bg-[#fff5f5] rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="steps"
            stroke="#800020"
            strokeWidth={2}
            name="Steps"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="calories"
            stroke="#800020"
            strokeWidth={2}
            name="Calories"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StepChart;
