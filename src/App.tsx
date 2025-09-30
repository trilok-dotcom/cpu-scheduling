import React, { useState, useEffect } from 'react';
import { Process, SchedulingResult, SchedulingAlgorithm } from './types/scheduling';
import { fcfs, sjf, priorityScheduling, roundRobin } from './utils/schedulingAlgorithms';
import ProcessInput from './components/ProcessInput';
import AlgorithmSelector from './components/AlgorithmSelector';
import GanttChart from './components/GanttChart';
import ResultsTable from './components/ResultsTable';
import AIRecommendations from './components/AIRecommendations';
import DeadlockDetection from './components/DeadlockDetection';
import ThemeToggle from './components/ThemeToggle';
import ExportResults from './components/ExportResults';
import { Cpu, Shield, Brain, BarChart3, Play, Settings } from 'lucide-react';

function App() {
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, arrivalTime: 0, burstTime: 8, priority: 2, remainingTime: 8 },
    { id: 2, arrivalTime: 1, burstTime: 4, priority: 1, remainingTime: 4 },
    { id: 3, arrivalTime: 2, burstTime: 9, priority: 3, remainingTime: 9 },
    { id: 4, arrivalTime: 3, burstTime: 5, priority: 2, remainingTime: 5 }
  ]);

  const [selectedAlgorithms, setSelectedAlgorithms] = useState<SchedulingAlgorithm[]>(['FCFS', 'SJF', 'ROUND_ROBIN']);
  const [timeQuantum, setTimeQuantum] = useState<number>(4);
  const [results, setResults] = useState<SchedulingResult[]>([]);
  const [activeTab, setActiveTab] = useState<'scheduling' | 'deadlock' | 'comparison'>('scheduling');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const runSimulations = () => {
    if (processes.length === 0 || selectedAlgorithms.length === 0) {
      alert('Please add processes and select at least one algorithm.');
      return;
    }

    const newResults: SchedulingResult[] = [];

    selectedAlgorithms.forEach(algorithm => {
      let result: SchedulingResult;

      switch (algorithm) {
        case 'FCFS':
          result = fcfs([...processes]);
          break;
        case 'SJF':
          result = sjf([...processes], false);
          break;
        case 'SJF_PREEMPTIVE':
          result = sjf([...processes], true);
          break;
        case 'PRIORITY':
          result = priorityScheduling([...processes], false);
          break;
        case 'PRIORITY_PREEMPTIVE':
          result = priorityScheduling([...processes], true);
          break;
        case 'ROUND_ROBIN':
          result = roundRobin([...processes], timeQuantum);
          break;
        default:
          return;
      }

      newResults.push(result);
    });

    setResults(newResults);
  };

  const clearResults = () => {
    setResults([]);
  };

  const tabs = [
    { id: 'scheduling', label: 'CPU Scheduling', icon: Cpu },
    { id: 'deadlock', label: 'Deadlock Detection', icon: Shield },
    { id: 'comparison', label: 'Algorithm Comparison', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  OS Scheduling Simulator
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interactive CPU Scheduling & Deadlock Detection Tool
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scheduling' && (
          <div className="space-y-8">
            {/* Configuration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProcessInput 
                processes={processes} 
                onProcessesChange={setProcesses} 
              />
              <AlgorithmSelector
                selectedAlgorithms={selectedAlgorithms}
                onAlgorithmChange={setSelectedAlgorithms}
                timeQuantum={timeQuantum}
                onTimeQuantumChange={setTimeQuantum}
              />
            </div>

            {/* AI Recommendations */}
            <AIRecommendations processes={processes} />

            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={runSimulations}
                disabled={processes.length === 0 || selectedAlgorithms.length === 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
              >
                <Play size={20} />
                Run Simulations
              </button>
              {results.length > 0 && (
                <button
                  onClick={clearResults}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Settings size={20} />
                  Clear Results
                </button>
              )}
            </div>

            {/* Results Section */}
            {results.length > 0 && (
              <div className="space-y-8">
                {/* Gantt Charts */}
                <div className="grid grid-cols-1 gap-6">
                  {results.map((result, index) => (
                    <GanttChart key={index} result={result} />
                  ))}
                </div>

                {/* Results Table */}
                <ResultsTable results={results} />

                {/* Export Options */}
                <ExportResults results={results} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'deadlock' && (
          <DeadlockDetection />
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-8">
            {results.length > 0 ? (
              <div className="space-y-8">
                {/* Comparison Charts */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <BarChart3 size={24} />
                    Algorithm Performance Comparison
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Average Turnaround Time Comparison */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                        Average Turnaround Time
                      </h4>
                      <div className="space-y-2">
                        {results
                          .sort((a, b) => a.averageTurnaroundTime - b.averageTurnaroundTime)
                          .map((result, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {result.algorithmName}
                              </span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">
                                {result.averageTurnaroundTime}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Average Waiting Time Comparison */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">
                        Average Waiting Time
                      </h4>
                      <div className="space-y-2">
                        {results
                          .sort((a, b) => a.averageWaitingTime - b.averageWaitingTime)
                          .map((result, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {result.algorithmName}
                              </span>
                              <span className="font-medium text-green-700 dark:text-green-400">
                                {result.averageWaitingTime}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Average Response Time Comparison */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">
                        Average Response Time
                      </h4>
                      <div className="space-y-2">
                        {results
                          .sort((a, b) => a.averageResponseTime - b.averageResponseTime)
                          .map((result, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {result.algorithmName}
                              </span>
                              <span className="font-medium text-purple-700 dark:text-purple-400">
                                {result.averageResponseTime}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Best Algorithm Summary */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Performance Winners
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Best Turnaround:</span>
                        <div className="text-blue-600 dark:text-blue-400 font-semibold">
                          {results.reduce((best, current) => 
                            current.averageTurnaroundTime < best.averageTurnaroundTime ? current : best
                          ).algorithmName}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Best Waiting:</span>
                        <div className="text-green-600 dark:text-green-400 font-semibold">
                          {results.reduce((best, current) => 
                            current.averageWaitingTime < best.averageWaitingTime ? current : best
                          ).algorithmName}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Best Response:</span>
                        <div className="text-purple-600 dark:text-purple-400 font-semibold">
                          {results.reduce((best, current) => 
                            current.averageResponseTime < best.averageResponseTime ? current : best
                          ).algorithmName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Results Table */}
                <ResultsTable results={results} />

                {/* Export Options */}
                <ExportResults results={results} />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center transition-colors">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Comparison Data Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Run simulations from the CPU Scheduling tab to see algorithm performance comparisons here.
                </p>
                <button
                  onClick={() => setActiveTab('scheduling')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Go to CPU Scheduling
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;