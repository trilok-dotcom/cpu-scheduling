import React from 'react';
import { SchedulingResult } from '../types/scheduling';

interface GanttChartProps {
  result: SchedulingResult;
}

export default function GanttChart({ result }: GanttChartProps) {
  const { ganttChart, totalTime, algorithmName } = result;

  if (ganttChart.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No execution data to display</p>
      </div>
    );
  }

  const timeScale = Math.max(1, totalTime / 50); // Adjust scale for readability

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Gantt Chart - {algorithmName}
      </h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Timeline Header */}
          <div className="flex items-center mb-2">
            <div className="w-16 text-sm font-medium text-gray-700 dark:text-gray-300">Time:</div>
            <div className="flex-1 relative">
              <div className="flex">
                {Array.from({ length: totalTime + 1 }, (_, i) => i).map(time => (
                  <div
                    key={time}
                    className="relative text-xs text-gray-600 dark:text-gray-400"
                    style={{ 
                      width: `${Math.max(30, 600 / (totalTime + 1))}px`,
                      minWidth: '25px'
                    }}
                  >
                    <div className="text-center">{time}</div>
                    {time < totalTime && (
                      <div className="absolute top-4 left-0 w-full h-px bg-gray-300 dark:bg-gray-600"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gantt Chart Bars */}
          <div className="flex items-center">
            <div className="w-16 text-sm font-medium text-gray-700 dark:text-gray-300">Processes:</div>
            <div className="flex-1 relative h-12">
              {ganttChart.map((item, index) => {
                const width = (item.endTime - item.startTime) * Math.max(30, 600 / (totalTime + 1));
                const left = item.startTime * Math.max(30, 600 / (totalTime + 1));
                
                return (
                  <div
                    key={index}
                    className="absolute top-0 h-10 rounded-md flex items-center justify-center text-white font-medium text-sm shadow-sm border-2 border-white dark:border-gray-800 transition-all hover:shadow-md hover:z-10 hover:scale-105"
                    style={{
                      backgroundColor: item.color,
                      width: `${width}px`,
                      left: `${left}px`,
                      minWidth: '25px'
                    }}
                    title={`Process P${item.processId}: ${item.startTime} - ${item.endTime} (${item.endTime - item.startTime} units)`}
                  >
                    P{item.processId}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(ganttChart.map(item => item.processId)))
                .sort((a, b) => a - b)
                .map(processId => {
                  const item = ganttChart.find(g => g.processId === processId)!;
                  const totalExecutionTime = ganttChart
                    .filter(g => g.processId === processId)
                    .reduce((sum, g) => sum + (g.endTime - g.startTime), 0);
                  
                  return (
                    <div key={processId} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        P{processId} ({totalExecutionTime} units)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}