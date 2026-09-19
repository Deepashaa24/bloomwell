import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SymptomChart = ({ data }) => {
  // Count symptom frequencies
  const symptomCounts = {};
  
  data.forEach((log) => {
    log.symptoms?.forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const chartData = Object.entries(symptomCounts)
    .map(([symptom, count]) => ({
      symptom,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 symptoms

  if (chartData.length === 0) {
    return (
      <div className="bg-[#fff5f5] rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Symptom Frequency</h3>
        <p className="text-gray-500 text-center py-8">No symptom data available</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fff5f5] rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Symptom Frequency</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="symptom" type="category" width={100} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#800020" name="Occurrences" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SymptomChart;
