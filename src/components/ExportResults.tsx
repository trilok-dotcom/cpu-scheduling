import React from 'react';
import { SchedulingResult } from '../types/scheduling';
import { Download, FileText, Code } from 'lucide-react';

interface ExportResultsProps {
  results: SchedulingResult[];
}

export default function ExportResults({ results }: ExportResultsProps) {
  const exportToJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scheduling_results_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = () => {
    if (results.length === 0) return;

    const headers = [
      'Algorithm',
      'Process_ID',
      'Arrival_Time',
      'Burst_Time',
      'Completion_Time',
      'Turnaround_Time',
      'Waiting_Time',
      'Response_Time'
    ];

    const rows = results.flatMap(result => 
      result.processes.map(process => [
        result.algorithmName,
        `P${process.id}`,
        process.arrivalTime,
        process.burstTime,
        process.completionTime,
        process.turnaroundTime,
        process.waitingTime,
        process.responseTime
      ])
    );

    // Add summary row
    const summaryHeaders = ['Algorithm', 'Avg_Turnaround_Time', 'Avg_Waiting_Time', 'Avg_Response_Time', 'Total_Time'];
    const summaryRows = results.map(result => [
      result.algorithmName,
      result.averageTurnaroundTime,
      result.averageWaitingTime,
      result.averageResponseTime,
      result.totalTime
    ]);

    const csvContent = [
      '# Process Details',
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      '# Summary Statistics',
      summaryHeaders.join(','),
      ...summaryRows.map(row => row.join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scheduling_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = () => {
    if (results.length === 0) return;

    const reportContent = [
      'CPU SCHEDULING SIMULATION REPORT',
      '=' .repeat(50),
      `Generated on: ${new Date().toLocaleString()}`,
      `Number of algorithms tested: ${results.length}`,
      '',
      ...results.map(result => [
        `ALGORITHM: ${result.algorithmName}`,
        '-'.repeat(30),
        `Total execution time: ${result.totalTime} time units`,
        `Average turnaround time: ${result.averageTurnaroundTime}`,
        `Average waiting time: ${result.averageWaitingTime}`,
        `Average response time: ${result.averageResponseTime}`,
        '',
        'Process Details:',
        'Process | Arrival | Burst | Completion | Turnaround | Waiting | Response',
        '-'.repeat(70),
        ...result.processes.map(p => 
          `P${p.id.toString().padEnd(6)} | ${p.arrivalTime.toString().padEnd(7)} | ${p.burstTime.toString().padEnd(5)} | ${(p.completionTime || 0).toString().padEnd(10)} | ${(p.turnaroundTime || 0).toString().padEnd(10)} | ${(p.waitingTime || 0).toString().padEnd(7)} | ${(p.responseTime || 0)}`
        ),
        '',
        ''
      ]).flat()
    ].join('\n');

    const dataBlob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scheduling_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Download size={20} />
        Export Results
      </h3>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportToJSON}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          <Code size={16} />
          Export JSON
        </button>
        
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
        >
          <FileText size={16} />
          Export CSV
        </button>
        
        <button
          onClick={generateReport}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
        >
          <FileText size={16} />
          Generate Report
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
        Export simulation results in various formats for further analysis or documentation.
      </p>
    </div>
  );
}