import { useState, useEffect } from 'react';
import { subDays, format } from 'date-fns';
import StepChart from '../components/StepChart';
import SymptomChart from '../components/SymptomChart';
import ExpandedMetricsChart from '../components/ExpandedMetricsChart';
import { aiAPI, logsAPI } from '../services/api';
import { FileDown, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';

const ReportsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // Default 30 days
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportProgress, setReportProgress] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    fetchSummary();
  }, [dateRange]);

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await aiAPI.generateReportSummary(dateRange);
      setAiSummary(response.data.summary);
    } catch (error) {
      setAiSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(dateRange));

      const response = await logsAPI.getLogsRange(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );

      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (logs.length === 0) return null;

    const totalSteps = logs.reduce((sum, log) => sum + (log.steps || 0), 0);
    const totalCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const avgSteps = Math.round(totalSteps / logs.length);
    const avgCalories = Math.round(totalCalories / logs.length);
    const daysLogged = logs.length;

    return { totalSteps, totalCalories, avgSteps, avgCalories, daysLogged };
  };

  const stats = calculateStats();

  const generateReport = async () => {
    setReportLoading(true);
    setReportProgress('Analyzing your cycle patterns...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setReportProgress('Writing your summary...');
      const response = await aiAPI.generateReport(dateRange);
      setReport(response.data.report);
      setReportProgress('Your report is ready.');
    } catch (error) {
      setReportProgress('We could not generate a report right now. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const pdf = new jsPDF();
    let y = 20;
    pdf.setFontSize(20); pdf.text(report.title, 20, y); y += 14;
    pdf.setFontSize(11);
    [report.overview, report.patterns, ...(report.discussionPoints || []).map((point) => `Discussion point: ${point}`), report.disclaimer].forEach((section) => { const lines = pdf.splitTextToSize(section, 170); pdf.text(lines, 20, y); y += lines.length * 6 + 8; if (y > 270) { pdf.addPage(); y = 20; } });
    pdf.save('Bloomwell-health-report.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 relative overflow-hidden">

      {/* Decorative Blood Droplets */}
      <div className="absolute top-16 right-12 opacity-15 animate-pulse">
        <svg className="w-24 h-32 text-blue-300" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      <div className="absolute bottom-20 left-16 opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>
        <svg className="w-18 h-26 text-blue-400" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      <div className="absolute top-1/2 left-10 opacity-15">
        <svg className="w-16 h-22 text-blue-300" viewBox="0 0 100 140" fill="currentColor">
          <path d="M50,10 C30,30 20,50 20,70 C20,95 32,110 50,110 C68,110 80,95 80,70 C80,50 70,30 50,10 Z" />
        </svg>
      </div>

      {/* Chart Icons */}
      <div className="absolute top-1/4 right-1/4 opacity-10">
        <svg className="w-28 h-28 text-blue-200" viewBox="0 0 100 100" fill="currentColor">
          <rect x="10" y="60" width="15" height="30" rx="3" />
          <rect x="35" y="40" width="15" height="50" rx="3" />
          <rect x="60" y="50" width="15" height="40" rx="3" />
          <rect x="85" y="30" width="15" height="60" rx="3" />
        </svg>
      </div>

      {/* Decorative Pills */}
      <div className="absolute bottom-1/3 right-20 opacity-15">
        <svg className="w-24 h-14 text-blue-300" viewBox="0 0 100 50" fill="currentColor">
          <rect x="5" y="8" width="35" height="30" rx="15" />
          <rect x="55" y="8" width="35" height="30" rx="15" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Reports</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateRange('7')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === '7'
                  ? 'bg-primary-600 text-[#fff5f5]'
                  : 'bg-[#fff5f5] text-gray-700 hover:bg-gray-100'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === '30'
                  ? 'bg-primary-600 text-[#fff5f5]'
                  : 'bg-[#fff5f5] text-gray-700 hover:bg-gray-100'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('90')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === '90'
                  ? 'bg-primary-600 text-[#fff5f5]'
                  : 'bg-[#fff5f5] text-gray-700 hover:bg-gray-100'
              }`}
            >
              90 Days
            </button>
            <button type="button" onClick={generateReport} disabled={reportLoading} className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-[#fff5f5] transition hover:bg-blue-600 disabled:opacity-60"><Sparkles size={16} />{reportLoading ? 'Generating...' : 'Generate Report'}</button>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow dark:border-navy-700 dark:bg-navy-900" aria-labelledby="ai-summary-heading"><div className="mb-3 flex items-center gap-2"><Sparkles className="text-blue-500" size={19} /><p className="text-xs font-bold   text-blue-500">AI Summary</p></div>{summaryLoading ? <div className="space-y-2 animate-pulse"><div className="h-5 w-3/4 rounded bg-blue-100 dark:bg-navy-700" /><div className="h-3 w-full rounded bg-blue-50 dark:bg-navy-700" /><div className="h-3 w-5/6 rounded bg-blue-50 dark:bg-navy-700" /></div> : aiSummary ? <><h3 id="ai-summary-heading" className="font-display text-2xl font-semibold text-gray-800 dark:text-blue-50">{aiSummary.title}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-200">{aiSummary.blurb}</p></> : <p className="text-sm text-gray-500">There is not enough data to summarize this range yet.</p>}</section>

        {(reportLoading || reportProgress) && <div className="mb-8 rounded-2xl border border-blue-100 bg-[#fff5f5] p-5 shadow dark:border-navy-700 dark:bg-navy-900"><div className="flex items-center gap-3"><Sparkles className="animate-pulse text-blue-500" size={20} /><p className="text-sm font-semibold text-gray-700 dark:text-blue-100">{reportProgress}</p></div>{reportLoading && <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100 dark:bg-navy-700"><div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" /></div>}</div>}

        {report && !reportLoading && <article className="mb-8 rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow dark:border-navy-700 dark:bg-navy-900" aria-labelledby="report-title"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold   text-blue-500">AI-generated report</p><h3 id="report-title" className="mt-1 text-2xl font-bold text-gray-800 dark:text-blue-50">{report.title}</h3></div><button type="button" onClick={downloadReport} className="flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-navy-700 dark:text-blue-200"><FileDown size={16} />Download as PDF</button></div><div className="space-y-4 text-sm leading-6 text-gray-700 dark:text-gray-200"><p>{report.overview}</p><p>{report.patterns}</p>{report.discussionPoints?.length > 0 && <div><h4 className="font-bold text-gray-800 dark:text-blue-50">Points to discuss with your doctor</h4><ul className="mt-2 list-disc space-y-1 pl-5">{report.discussionPoints.map((point) => <li key={point}>{point}</li>)}</ul></div>}<p className="border-t border-blue-100 pt-4 text-xs text-gray-500 dark:border-navy-700 dark:text-gray-300">{report.disclaimer}</p></div></article>}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#fff5f5] rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Days Logged</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {stats.daysLogged}
              </p>
            </div>

            <div className="bg-[#fff5f5] rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Steps</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {stats.totalSteps.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#fff5f5] rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Avg Steps/Day</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {stats.avgSteps.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#fff5f5] rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Avg Calories/Day</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {stats.avgCalories.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {logs.length > 0 ? (
          <div className="space-y-8">
            {/* Activity Chart */}
            <StepChart data={logs} />

            {/* Symptom Chart */}
            <SymptomChart data={logs} />

            <ExpandedMetricsChart data={logs} />

            {/* Symptoms Frequency */}
            <div className="bg-[#fff5f5] rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Symptoms Frequency</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Flow Frequency */}
                {(() => {
                  const flowCounts = logs.reduce((acc, log) => {
                    if (log.flow) {
                      acc[log.flow] = (acc[log.flow] || 0) + 1;
                    }
                    return acc;
                  }, {});
                  const flowTotal = Object.values(flowCounts).reduce((a, b) => a + b, 0);
                  
                  return flowTotal > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Flow</h4>
                      <div className="space-y-2">
                        {Object.entries(flowCounts).map(([flow, count]) => {
                          const percentage = (count / flowTotal) * 100;
                          return (
                            <div key={flow}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">{flow}</span>
                                <span className="text-sm text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Pain Frequency */}
                {(() => {
                  const painCounts = {};
                  logs.forEach(log => {
                    log.pain?.forEach(item => {
                      painCounts[item] = (painCounts[item] || 0) + 1;
                    });
                  });
                  const painTotal = Object.values(painCounts).reduce((a, b) => a + b, 0);
                  
                  return painTotal > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Pain</h4>
                      <div className="space-y-2">
                        {Object.entries(painCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([pain, count]) => {
                            const percentage = (count / logs.length) * 100;
                            return (
                              <div key={pain}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">{pain}</span>
                                  <span className="text-sm text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Feelings Frequency */}
                {(() => {
                  const feelingsCounts = {};
                  logs.forEach(log => {
                    log.feelings?.forEach(item => {
                      feelingsCounts[item] = (feelingsCounts[item] || 0) + 1;
                    });
                  });
                  const feelingsTotal = Object.values(feelingsCounts).reduce((a, b) => a + b, 0);
                  
                  return feelingsTotal > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Feelings</h4>
                      <div className="space-y-2">
                        {Object.entries(feelingsCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([feeling, count]) => {
                            const percentage = (count / logs.length) * 100;
                            return (
                              <div key={feeling}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">{feeling}</span>
                                  <span className="text-sm text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Energy Frequency */}
                {(() => {
                  const energyCounts = {};
                  logs.forEach(log => {
                    log.energy?.forEach(item => {
                      energyCounts[item] = (energyCounts[item] || 0) + 1;
                    });
                  });
                  const energyTotal = Object.values(energyCounts).reduce((a, b) => a + b, 0);
                  
                  return energyTotal > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Energy Levels</h4>
                      <div className="space-y-2">
                        {Object.entries(energyCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([energy, count]) => {
                            const percentage = (count / logs.length) * 100;
                            return (
                              <div key={energy}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">{energy}</span>
                                  <span className="text-sm text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Mind Frequency */}
                {(() => {
                  const mindCounts = {};
                  logs.forEach(log => {
                    log.mind?.forEach(item => {
                      mindCounts[item] = (mindCounts[item] || 0) + 1;
                    });
                  });
                  const mindTotal = Object.values(mindCounts).reduce((a, b) => a + b, 0);
                  
                  return mindTotal > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Mind</h4>
                      <div className="space-y-2">
                        {Object.entries(mindCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([mind, count]) => {
                            const percentage = (count / logs.length) * 100;
                            return (
                              <div key={mind}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">{mind}</span>
                                  <span className="text-sm text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Sleep Quality Frequency */}
                {(() => {
                  const sleepCounts = {};
                  logs.forEach(log => {
                    log.sleepQuality?.forEach(item => {
                      sleepCounts[item] = (sleepCounts[item] || 0) + 1;
                    });
                  });
                  const sleepTotal = Object.values(sleepCounts).reduce((a, b) => a + b, 0);
                  
                  return sleepTotal > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Sleep Quality</h4>
                      <div className="space-y-2">
                        {Object.entries(sleepCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([sleep, count]) => {
                            const percentage = (count / logs.length) * 100;
                            return (
                              <div key={sleep}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">{sleep}</span>
                                  <span className="text-sm text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* PMS Frequency */}
                {(() => {
                  const pmsCount = logs.filter(log => log.pms).length;
                  const noPmsCount = logs.length - pmsCount;
                  
                  return pmsCount > 0 || noPmsCount > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">PMS</h4>
                      <div className="space-y-2">
                        {pmsCount > 0 && (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Yes</span>
                              <span className="text-sm text-gray-500">{pmsCount} ({((pmsCount / logs.length) * 100).toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${(pmsCount / logs.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">No</span>
                            <span className="text-sm text-gray-500">{noPmsCount} ({((noPmsCount / logs.length) * 100).toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${(noPmsCount / logs.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Saved Symptom Logs */}
            <div className="bg-[#fff5f5] rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Symptom Log History</h3>
              <p className="text-xs text-gray-400 mb-2">Total logs: {logs.length}</p>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {logs
                  .filter(log => 
                    log.flow || 
                    log.spotting?.length > 0 || 
                    log.feelings?.length > 0 || 
                    log.pain?.length > 0 || 
                    log.collectionMethod?.length > 0 ||
                    log.mind?.length > 0 ||
                    log.socialLife?.length > 0 ||
                    log.sexLife?.length > 0 ||
                    log.energy?.length > 0 ||
                    log.pms ||
                    log.sleepQuality?.length > 0 ||
                    log.sleepHours ||
                    log.dailyNote
                  )
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((log) => (
                    <div key={log._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-800">
                          {format(new Date(log.date), 'MMMM d, yyyy')}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {format(new Date(log.date), 'EEEE')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {/* Flow */}
                        {log.flow && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Flow:</span>
                            <span className="text-gray-600">{log.flow}</span>
                          </div>
                        )}

                        {/* Spotting */}
                        {log.spotting?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Spotting:</span>
                            <span className="text-gray-600">{log.spotting.join(', ')}</span>
                          </div>
                        )}

                        {/* Feelings */}
                        {log.feelings?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Feelings:</span>
                            <span className="text-gray-600">{log.feelings.join(', ')}</span>
                          </div>
                        )}

                        {/* Pain */}
                        {log.pain?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Pain:</span>
                            <span className="text-gray-600">{log.pain.join(', ')}</span>
                          </div>
                        )}

                        {/* Collection Method */}
                        {log.collectionMethod?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Collection:</span>
                            <span className="text-gray-600">{log.collectionMethod.join(', ')}</span>
                          </div>
                        )}

                        {/* Mind */}
                        {log.mind?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Mind:</span>
                            <span className="text-gray-600">{log.mind.join(', ')}</span>
                          </div>
                        )}

                        {/* Social Life */}
                        {log.socialLife?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Social Life:</span>
                            <span className="text-gray-600">{log.socialLife.join(', ')}</span>
                          </div>
                        )}

                        {/* Sex Life */}
                        {log.sexLife?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Sex Life:</span>
                            <span className="text-gray-600">{log.sexLife.join(', ')}</span>
                          </div>
                        )}

                        {/* Energy */}
                        {log.energy?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Energy:</span>
                            <span className="text-gray-600">{log.energy.join(', ')}</span>
                          </div>
                        )}

                        {/* PMS */}
                        {log.pms && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">PMS:</span>
                            <span className="text-blue-600 font-medium">Yes</span>
                          </div>
                        )}

                        {/* Sleep Quality */}
                        {log.sleepQuality?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Sleep Quality:</span>
                            <span className="text-gray-600">{log.sleepQuality.join(', ')}</span>
                          </div>
                        )}

                        {/* Sleep Duration */}
                        {(log.sleepHours || log.sleepMinutes) && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700 min-w-[100px]">Sleep:</span>
                            <span className="text-gray-600">
                              {log.sleepHours || 0}h {log.sleepMinutes || 0}m
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Daily Note */}
                      {log.dailyNote && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="font-medium text-gray-700 text-sm mb-1">Note:</p>
                          <p className="text-gray-600 text-sm italic">{log.dailyNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                
                {logs.filter(log => 
                  log.flow || 
                  log.spotting?.length > 0 || 
                  log.feelings?.length > 0 || 
                  log.pain?.length > 0 || 
                  log.collectionMethod?.length > 0 ||
                  log.mind?.length > 0 ||
                  log.socialLife?.length > 0 ||
                  log.sexLife?.length > 0 ||
                  log.energy?.length > 0 ||
                  log.pms ||
                  log.sleepQuality?.length > 0 ||
                  log.sleepHours ||
                  log.dailyNote
                ).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No symptom logs found for this period.</p>
                    <p className="text-gray-400 text-sm mt-1">Start tracking your symptoms on the Dashboard!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#fff5f5] rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              No data available for the selected period.
            </p>
            <p className="text-gray-400 mt-2">
              Start logging your daily activities to see reports!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
