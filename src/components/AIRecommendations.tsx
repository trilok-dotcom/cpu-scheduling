import React from 'react';
import { Process } from '../types/scheduling';
import { getAIRecommendation } from '../utils/aiRecommendations';
import { Brain, TrendingUp, AlertCircle } from 'lucide-react';

interface AIRecommendationsProps {
  processes: Process[];
}

export default function AIRecommendations({ processes }: AIRecommendationsProps) {
  if (processes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transition-colors">
        <Brain className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Add processes to get AI-powered algorithm recommendations</p>
      </div>
    );
  }

  const recommendation = getAIRecommendation(processes);

  const confidenceColor = recommendation.confidence >= 80 
    ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900'
    : recommendation.confidence >= 60 
    ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900'
    : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';

  const getAlgorithmDisplayName = (algorithm: string) => {
    const names: { [key: string]: string } = {
      'FCFS': 'First Come First Serve',
      'SJF': 'Shortest Job First',
      'SJF_PREEMPTIVE': 'Shortest Job First (Preemptive)',
      'PRIORITY': 'Priority Scheduling',
      'PRIORITY_PREEMPTIVE': 'Priority Scheduling (Preemptive)',
      'ROUND_ROBIN': 'Round Robin'
    };
    return names[algorithm] || algorithm;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-gray-700 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Algorithm Recommendation</h3>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended: {getAlgorithmDisplayName(recommendation.recommendedAlgorithm)}
          </h4>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${confidenceColor}`}>
            {recommendation.confidence}% confidence
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {recommendation.reasoning}
        </p>
      </div>

      {recommendation.alternativeAlgorithms.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp size={20} />
            Alternative Options
          </h4>
          <div className="space-y-3">
            {recommendation.alternativeAlgorithms.map((alt, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <AlertCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {getAlgorithmDisplayName(alt.algorithm)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {alt.reasoning}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 <strong>Tip:</strong> These recommendations are based on process characteristics like burst time variance, 
          arrival patterns, and priority distributions. Consider your specific system requirements when making the final choice.
        </p>
      </div>
    </div>
  );
}