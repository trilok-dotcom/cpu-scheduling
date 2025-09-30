import React from 'react';
import { SchedulingResult } from '../types/scheduling';

interface ResultsTableProps {
  results: SchedulingResult[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transition-colors">
        <p className="text-gray-500 dark:text-gray-400">No results to display. Run algorithms to see performance metrics.</p>
      </div>
    );
  }

  const allProcesses = results[0]?.processes || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Performance Results</h3>

      {/* Individual Process Results */}
      <div className="space-y-6">
        {results.map((result, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {result.algorithmName}
            </h4>
            
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-4 py-2 text-left font-medium text-gray-900 dark:text-white">Process</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-900 dark:text-white">Arrival</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-900 dark:text-white">Burst</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-900 dark:text-white">Completion</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-900 dark:text-white">Turnaround</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-900 dark:text-white">Waiting</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-900 dark:text-white">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {result.processes.map((process) => (
                    <tr key={process.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 transition-colors">
                      <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">P{process.id}</td>
                      <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">{process.arrivalTime}</td>
                      <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">{process.burstTime}</td>
                      <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">{process.completionTime}</td>
                      <td className="px-4 py-2 text-center text-blue-600 dark:text-blue-400 font-medium">{process.turnaroundTime}</td>
                      <td className="px-4 py-2 text-center text-green-600 dark:text-green-400 font-medium">{process.waitingTime}</td>
                      <td className="px-4 py-2 text-center text-purple-600 dark:text-purple-400 font-medium">{process.responseTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Average Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                  Avg Turnaround Time
                </div>
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {result.averageTurnaroundTime}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                <div className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                  Avg Waiting Time
                </div>
                <div className="text-lg font-bold text-green-900 dark:text-green-100">
                  {result.averageWaitingTime}
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                <div className="text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                  Avg Response Time
                </div>
                <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  {result.averageResponseTime}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Summary */}
      {results.length > 1 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Algorithm Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Best Turnaround Time:</div>
              <div className="text-blue-600 dark:text-blue-400 font-semibold">
                {results.reduce((best, current) => 
                  current.averageTurnaroundTime < best.averageTurnaroundTime ? current : best
                ).algorithmName} ({results.reduce((best, current) => 
                  current.averageTurnaroundTime < best.averageTurnaroundTime ? current : best
                ).averageTurnaroundTime})
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Best Waiting Time:</div>
              <div className="text-green-600 dark:text-green-400 font-semibold">
                {results.reduce((best, current) => 
                  current.averageWaitingTime < best.averageWaitingTime ? current : best
                ).algorithmName} ({results.reduce((best, current) => 
                  current.averageWaitingTime < best.averageWaitingTime ? current : best
                ).averageWaitingTime})
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Best Response Time:</div>
              <div className="text-purple-600 dark:text-purple-400 font-semibold">
                {results.reduce((best, current) => 
                  current.averageResponseTime < best.averageResponseTime ? current : best
                ).algorithmName} ({results.reduce((best, current) => 
                  current.averageResponseTime < best.averageResponseTime ? current : best
                ).averageResponseTime})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}