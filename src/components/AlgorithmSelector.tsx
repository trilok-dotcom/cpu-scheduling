import React from 'react';
import { SchedulingAlgorithm } from '../types/scheduling';
import { Clock, Zap, Star, RotateCcw } from 'lucide-react';

interface AlgorithmSelectorProps {
  selectedAlgorithms: SchedulingAlgorithm[];
  onAlgorithmChange: (algorithms: SchedulingAlgorithm[]) => void;
  timeQuantum: number;
  onTimeQuantumChange: (quantum: number) => void;
}

const algorithmInfo = {
  FCFS: {
    name: 'First Come First Serve',
    description: 'Processes are executed in order of arrival',
    icon: Clock,
    color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
  },
  SJF: {
    name: 'Shortest Job First',
    description: 'Non-preemptive - shortest burst time first',
    icon: Zap,
    color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
  },
  SJF_PREEMPTIVE: {
    name: 'Shortest Job First (Preemptive)',
    description: 'Preemptive - can interrupt running processes',
    icon: Zap,
    color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
  },
  PRIORITY: {
    name: 'Priority Scheduling',
    description: 'Non-preemptive - highest priority first',
    icon: Star,
    color: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
  },
  PRIORITY_PREEMPTIVE: {
    name: 'Priority Scheduling (Preemptive)',
    description: 'Preemptive - can interrupt for higher priority',
    icon: Star,
    color: 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
  },
  ROUND_ROBIN: {
    name: 'Round Robin',
    description: 'Each process gets equal time slices',
    icon: RotateCcw,
    color: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
  }
};

export default function AlgorithmSelector({
  selectedAlgorithms,
  onAlgorithmChange,
  timeQuantum,
  onTimeQuantumChange
}: AlgorithmSelectorProps) {
  const toggleAlgorithm = (algorithm: SchedulingAlgorithm) => {
    if (selectedAlgorithms.includes(algorithm)) {
      onAlgorithmChange(selectedAlgorithms.filter(a => a !== algorithm));
    } else {
      onAlgorithmChange([...selectedAlgorithms, algorithm]);
    }
  };

  const selectAll = () => {
    onAlgorithmChange(Object.keys(algorithmInfo) as SchedulingAlgorithm[]);
  };

  const clearAll = () => {
    onAlgorithmChange([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scheduling Algorithms</h2>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {(Object.entries(algorithmInfo) as [SchedulingAlgorithm, typeof algorithmInfo[SchedulingAlgorithm]][]).map(([algorithm, info]) => {
          const Icon = info.icon;
          const isSelected = selectedAlgorithms.includes(algorithm);
          
          return (
            <button
              key={algorithm}
              onClick={() => toggleAlgorithm(algorithm)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md transform scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${info.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {info.name}
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {info.description}
              </p>
            </button>
          );
        })}
      </div>

      {selectedAlgorithms.includes('ROUND_ROBIN') && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <RotateCcw className="text-orange-600 dark:text-orange-400" size={20} />
            <label className="font-medium text-orange-800 dark:text-orange-300">
              Time Quantum for Round Robin
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={timeQuantum}
              onChange={(e) => onTimeQuantumChange(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-1 border border-orange-300 dark:border-orange-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <span className="text-sm text-orange-700 dark:text-orange-400">time units</span>
          </div>
        </div>
      )}

      {selectedAlgorithms.length === 0 && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Select at least one algorithm to run simulations</p>
        </div>
      )}
    </div>
  );
}