import React, { useState } from 'react';
import { Resource, AllocationMatrix, DeadlockResult } from '../types/scheduling';
import { detectDeadlock } from '../utils/deadlockDetection';
import { Shield, ShieldAlert, Plus, Trash2, Play } from 'lucide-react';

export default function DeadlockDetection() {
  const [resources, setResources] = useState<Resource[]>([
    { id: 1, name: 'R1', totalInstances: 3, availableInstances: 1 },
    { id: 2, name: 'R2', totalInstances: 2, availableInstances: 1 }
  ]);

  const [allocations, setAllocations] = useState<AllocationMatrix[]>([
    { processId: 1, allocations: [1, 0], maxNeeds: [2, 1], needs: [1, 1] },
    { processId: 2, allocations: [1, 1], maxNeeds: [3, 2], needs: [2, 1] },
    { processId: 3, allocations: [1, 0], maxNeeds: [2, 1], needs: [1, 1] }
  ]);

  const [result, setResult] = useState<DeadlockResult | null>(null);

  const addResource = () => {
    const newId = Math.max(...resources.map(r => r.id), 0) + 1;
    const newResource: Resource = {
      id: newId,
      name: `R${newId}`,
      totalInstances: 3,
      availableInstances: 1
    };
    setResources([...resources, newResource]);
    
    // Update allocations to include new resource
    setAllocations(allocations.map(alloc => ({
      ...alloc,
      allocations: [...alloc.allocations, 0],
      maxNeeds: [...alloc.maxNeeds, 1],
      needs: [...alloc.needs, 1]
    })));
  };

  const removeResource = (id: number) => {
    const resourceIndex = resources.findIndex(r => r.id === id);
    if (resourceIndex === -1) return;

    setResources(resources.filter(r => r.id !== id));
    setAllocations(allocations.map(alloc => ({
      ...alloc,
      allocations: alloc.allocations.filter((_, i) => i !== resourceIndex),
      maxNeeds: alloc.maxNeeds.filter((_, i) => i !== resourceIndex),
      needs: alloc.needs.filter((_, i) => i !== resourceIndex)
    })));
  };

  const addProcess = () => {
    const newProcessId = Math.max(...allocations.map(a => a.processId), 0) + 1;
    const newAllocation: AllocationMatrix = {
      processId: newProcessId,
      allocations: resources.map(() => 0),
      maxNeeds: resources.map(() => 1),
      needs: resources.map(() => 1)
    };
    setAllocations([...allocations, newAllocation]);
  };

  const removeProcess = (processId: number) => {
    setAllocations(allocations.filter(a => a.processId !== processId));
  };

  const updateResource = (id: number, field: keyof Resource, value: number | string) => {
    setResources(resources.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const updateAllocation = (processId: number, resourceIndex: number, field: 'allocations' | 'maxNeeds', value: number) => {
    setAllocations(allocations.map(alloc => {
      if (alloc.processId === processId) {
        const updated = { ...alloc };
        updated[field] = [...alloc[field]];
        updated[field][resourceIndex] = value;
        // Recalculate needs
        updated.needs = updated.maxNeeds.map((max, i) => max - updated.allocations[i]);
        return updated;
      }
      return alloc;
    }));
  };

  const runBankersAlgorithm = () => {
    const detectionResult = detectDeadlock(resources, allocations);
    setResult(detectionResult);
  };

  const generateExample = () => {
    setResources([
      { id: 1, name: 'Printer', totalInstances: 2, availableInstances: 0 },
      { id: 2, name: 'Scanner', totalInstances: 1, availableInstances: 0 },
      { id: 3, name: 'Disk', totalInstances: 3, availableInstances: 1 }
    ]);
    
    setAllocations([
      { processId: 1, allocations: [1, 0, 1], maxNeeds: [2, 1, 2], needs: [1, 1, 1] },
      { processId: 2, allocations: [1, 1, 0], maxNeeds: [1, 1, 2], needs: [0, 0, 2] },
      { processId: 3, allocations: [0, 0, 1], maxNeeds: [1, 1, 1], needs: [1, 1, 0] }
    ]);
    
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Deadlock Detection</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateExample}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            >
              Load Example
            </button>
            <button
              onClick={runBankersAlgorithm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Play size={16} />
              Run Analysis
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configure system resources and process allocations to detect potential deadlocks using Banker's Algorithm.
        </p>
      </div>

      {/* Resources Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Resources</h3>
          <button
            onClick={addResource}
            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1"
          >
            <Plus size={16} />
            Add Resource
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <th className="px-4 py-2 text-left font-medium text-gray-900 dark:text-white">Resource</th>
                <th className="px-4 py-2 text-center font-medium text-gray-900 dark:text-white">Total Instances</th>
                <th className="px-4 py-2 text-center font-medium text-gray-900 dark:text-white">Available</th>
                <th className="px-4 py-2 text-center font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 transition-colors">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={resource.name}
                      onChange={(e) => updateResource(resource.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      min="1"
                      value={resource.totalInstances}
                      onChange={(e) => updateResource(resource.id, 'totalInstances', parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max={resource.totalInstances}
                      value={resource.availableInstances}
                      onChange={(e) => updateResource(resource.id, 'availableInstances', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => removeResource(resource.id)}
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
      </div>

      {/* Process Allocation Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resource Allocation Matrix</h3>
          <button
            onClick={addProcess}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1"
          >
            <Plus size={16} />
            Add Process
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-2 py-2 text-left font-medium text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">Process</th>
                {resources.map((resource) => (
                  <th key={`alloc-${resource.id}`} className="px-2 py-2 text-center font-medium text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                    {resource.name}
                  </th>
                ))}
                <th className="px-2 py-1 text-center text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600">|</th>
                {resources.map((resource) => (
                  <th key={`max-${resource.id}`} className="px-2 py-2 text-center font-medium text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                    {resource.name}
                  </th>
                ))}
                <th className="px-2 py-1 text-center text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600">|</th>
                {resources.map((resource) => (
                  <th key={`need-${resource.id}`} className="px-2 py-2 text-center font-medium text-gray-900 dark:text-white">
                    {resource.name}
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
              <tr className="bg-gray-100 dark:bg-gray-600 text-xs">
                <th className="px-2 py-1 text-left text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">ID</th>
                <th className="px-2 py-1 text-center text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600" colSpan={resources.length}>
                  Allocation
                </th>
                <th className="px-2 py-1 text-center text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600"></th>
                <th className="px-2 py-1 text-center text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600" colSpan={resources.length}>
                  Max Need
                </th>
                <th className="px-2 py-1 text-center text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600"></th>
                <th className="px-2 py-1 text-center text-gray-600 dark:text-gray-300" colSpan={resources.length}>
                  Need
                </th>
                <th className="px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((allocation) => (
                <tr key={allocation.processId} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 transition-colors">
                  <td className="px-2 py-2 font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                    P{allocation.processId}
                  </td>
                  {allocation.allocations.map((alloc, index) => (
                    <td key={`alloc-${index}`} className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-600">
                      <input
                        type="number"
                        min="0"
                        value={alloc}
                        onChange={(e) => updateAllocation(allocation.processId, index, 'allocations', parseInt(e.target.value) || 0)}
                        className="w-12 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-600">|</td>
                  {allocation.maxNeeds.map((max, index) => (
                    <td key={`max-${index}`} className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-600">
                      <input
                        type="number"
                        min="0"
                        value={max}
                        onChange={(e) => updateAllocation(allocation.processId, index, 'maxNeeds', parseInt(e.target.value) || 0)}
                        className="w-12 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-600">|</td>
                  {allocation.needs.map((need, index) => (
                    <td key={`need-${index}`} className="px-2 py-2 text-center text-gray-700 dark:text-gray-300 font-medium">
                      {need}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => removeProcess(allocation.processId)}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            {result.isSafe ? (
              <>
                <Shield className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">System is Safe</h3>
              </>
            ) : (
              <>
                <ShieldAlert className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">Deadlock Detected</h3>
              </>
            )}
          </div>

          <div className={`p-4 rounded-lg mb-4 ${
            result.isSafe 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
          }`}>
            <p className={`font-medium ${
              result.isSafe 
                ? 'text-green-800 dark:text-green-300' 
                : 'text-red-800 dark:text-red-300'
            }`}>
              {result.message}
            </p>
          </div>

          {result.steps.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Algorithm Steps:</h4>
              <div className="space-y-2 text-sm">
                {result.steps.map((step, index) => (
                  <div key={index} className="text-gray-700 dark:text-gray-300 font-mono whitespace-pre-line">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}