import React, { useState } from 'react';
import { Process } from '../types/scheduling';
import { Plus, Trash2, Shuffle } from 'lucide-react';
import { generateRealisticWorkload } from '../utils/aiRecommendations';

interface ProcessInputProps {
  processes: Process[];
  onProcessesChange: (processes: Process[]) => void;
}

export default function ProcessInput({ processes, onProcessesChange }: ProcessInputProps) {
  const [newProcess, setNewProcess] = useState<Partial<Process>>({
    arrivalTime: 0,
    burstTime: 1,
    priority: 1
  });

  const addProcess = () => {
    if (newProcess.arrivalTime !== undefined && newProcess.burstTime !== undefined) {
      const process: Process = {
        id: processes.length + 1,
        arrivalTime: newProcess.arrivalTime,
        burstTime: newProcess.burstTime,
        priority: newProcess.priority || 1,
        remainingTime: newProcess.burstTime
      };
      onProcessesChange([...processes, process]);
      setNewProcess({ arrivalTime: 0, burstTime: 1, priority: 1 });
    }
  };

  const removeProcess = (id: number) => {
    const updatedProcesses = processes.filter(p => p.id !== id);
    // Renumber remaining processes
    const renumbered = updatedProcesses.map((p, index) => ({ ...p, id: index + 1 }));
    onProcessesChange(renumbered);
  };

  const updateProcess = (id: number, field: keyof Process, value: number) => {
    const updated = processes.map(p => {
      if (p.id === id) {
        const updatedProcess = { ...p, [field]: value };
        if (field === 'burstTime') {
          updatedProcess.remainingTime = value;
        }
        return updatedProcess;
      }
      return p;
    });
    onProcessesChange(updated);
  };

  const generateWorkload = (type: 'interactive' | 'cpu_intensive' | 'mixed') => {
    const generated = generateRealisticWorkload(type);
    onProcessesChange(generated);
  };

  const clearAll = () => {
    onProcessesChange([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Process Configuration</h2>
        <div className="flex gap-2">
          <button
            onClick={() => generateWorkload('interactive')}
            className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            Interactive
          </button>
          <button
            onClick={() => generateWorkload('cpu_intensive')}
            className="px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
          >
            CPU Intensive
          </button>
          <button
            onClick={() => generateWorkload('mixed')}
            className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            Mixed
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Add New Process Form */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Add New Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Arrival Time
            </label>
            <input
              type="number"
              min="0"
              value={newProcess.arrivalTime || 0}
              onChange={(e) => setNewProcess({ ...newProcess, arrivalTime: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Burst Time
            </label>
            <input
              type="number"
              min="1"
              value={newProcess.burstTime || 1}
              onChange={(e) => setNewProcess({ ...newProcess, burstTime: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <input
              type="number"
              min="1"
              value={newProcess.priority || 1}
              onChange={(e) => setNewProcess({ ...newProcess, priority: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lower = Higher Priority</p>
          </div>
          <div className="flex items-end">
            <button
              onClick={addProcess}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Process
            </button>
          </div>
        </div>
      </div>

      {/* Process List */}
      {processes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">Process ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">Arrival Time</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">Burst Time</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">Priority</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                    P{process.id}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                    <input
                      type="number"
                      min="0"
                      value={process.arrivalTime}
                      onChange={(e) => updateProcess(process.id, 'arrivalTime', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                    <input
                      type="number"
                      min="1"
                      value={process.burstTime}
                      onChange={(e) => updateProcess(process.id, 'burstTime', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                    <input
                      type="number"
                      min="1"
                      value={process.priority || 1}
                      onChange={(e) => updateProcess(process.id, 'priority', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => removeProcess(process.id)}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {processes.length === 0 && (
        <div className="text-center py-8">
          <Shuffle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No processes configured. Add processes or generate a workload to get started.</p>
        </div>
      )}
    </div>
  );
}