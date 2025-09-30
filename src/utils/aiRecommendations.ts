import { Process, SchedulingAlgorithm } from '../types/scheduling';

export interface AIRecommendation {
  recommendedAlgorithm: SchedulingAlgorithm;
  reasoning: string;
  confidence: number;
  alternativeAlgorithms: {
    algorithm: SchedulingAlgorithm;
    reasoning: string;
  }[];
}

export function getAIRecommendation(processes: Process[]): AIRecommendation {
  const n = processes.length;
  
  // Calculate statistics
  const burstTimes = processes.map(p => p.burstTime);
  const arrivalTimes = processes.map(p => p.arrivalTime);
  const priorities = processes.map(p => p.priority || 0).filter(p => p > 0);
  
  const avgBurstTime = burstTimes.reduce((a, b) => a + b, 0) / n;
  const burstVariance = burstTimes.reduce((acc, bt) => acc + Math.pow(bt - avgBurstTime, 2), 0) / n;
  const burstStdDev = Math.sqrt(burstVariance);
  
  const maxArrival = Math.max(...arrivalTimes);
  const minArrival = Math.min(...arrivalTimes);
  const arrivalSpread = maxArrival - minArrival;
  
  const maxBurst = Math.max(...burstTimes);
  const minBurst = Math.min(...burstTimes);
  const burstSpread = maxBurst - minBurst;
  
  const hasPriorities = priorities.length > 0;
  const uniquePriorities = new Set(priorities).size;
  
  // Decision logic
  let recommendedAlgorithm: SchedulingAlgorithm;
  let reasoning: string;
  let confidence: number;
  const alternatives: { algorithm: SchedulingAlgorithm; reasoning: string; }[] = [];
  
  // High burst time variance suggests SJF
  if (burstStdDev > avgBurstTime * 0.5 && burstSpread > avgBurstTime) {
    if (arrivalSpread > avgBurstTime * 0.3) {
      recommendedAlgorithm = 'SJF_PREEMPTIVE';
      reasoning = 'High variance in burst times with staggered arrivals. Preemptive SJF minimizes average waiting time by allowing shorter jobs to preempt longer ones.';
      confidence = 85;
      alternatives.push({
        algorithm: 'SJF',
        reasoning: 'Non-preemptive SJF if context switching overhead is a concern'
      });
    } else {
      recommendedAlgorithm = 'SJF';
      reasoning = 'High variance in burst times with similar arrival times. SJF minimizes average waiting time by scheduling shorter jobs first.';
      confidence = 90;
      alternatives.push({
        algorithm: 'SJF_PREEMPTIVE',
        reasoning: 'Preemptive SJF if new shorter jobs may arrive during execution'
      });
    }
    alternatives.push({
      algorithm: 'PRIORITY',
      reasoning: 'If job importance varies significantly with burst time'
    });
  }
  // Many processes with similar characteristics suggest Round Robin
  else if (n > 3 && burstStdDev < avgBurstTime * 0.3) {
    recommendedAlgorithm = 'ROUND_ROBIN';
    reasoning = 'Multiple processes with similar burst times. Round Robin provides fair CPU time distribution and good response time for interactive systems.';
    confidence = 80;
    alternatives.push({
      algorithm: 'FCFS',
      reasoning: 'If simplicity and predictability are more important than fairness'
    });
    alternatives.push({
      algorithm: 'SJF',
      reasoning: 'If minimizing total waiting time is the primary goal'
    });
  }
  // Priority-based scheduling when priorities are well distributed
  else if (hasPriorities && uniquePriorities > 1) {
    if (arrivalSpread > avgBurstTime * 0.2) {
      recommendedAlgorithm = 'PRIORITY_PREEMPTIVE';
      reasoning = 'Distinct priority levels with staggered arrivals. Preemptive priority ensures high-priority jobs get immediate attention.';
      confidence = 88;
      alternatives.push({
        algorithm: 'PRIORITY',
        reasoning: 'Non-preemptive priority if context switching overhead is significant'
      });
    } else {
      recommendedAlgorithm = 'PRIORITY';
      reasoning = 'Clear priority distinctions between processes. Priority scheduling ensures critical jobs execute first.';
      confidence = 85;
      alternatives.push({
        algorithm: 'PRIORITY_PREEMPTIVE',
        reasoning: 'Preemptive priority if high-priority jobs may arrive unexpectedly'
      });
    }
    alternatives.push({
      algorithm: 'ROUND_ROBIN',
      reasoning: 'If fairness is more important than priority distinctions'
    });
  }
  // Simple workloads or when fairness/predictability is key
  else if (n <= 3 || (burstStdDev < avgBurstTime * 0.2 && arrivalSpread < avgBurstTime * 0.1)) {
    recommendedAlgorithm = 'FCFS';
    reasoning = 'Simple workload with few processes or similar characteristics. FCFS provides predictable behavior and is easy to understand and implement.';
    confidence = 75;
    alternatives.push({
      algorithm: 'SJF',
      reasoning: 'If minimizing waiting time is more important than simplicity'
    });
    alternatives.push({
      algorithm: 'ROUND_ROBIN',
      reasoning: 'If interactive response time is important'
    });
  }
  // Default to Round Robin for balanced performance
  else {
    recommendedAlgorithm = 'ROUND_ROBIN';
    reasoning = 'Mixed workload characteristics. Round Robin provides balanced performance with good response time and fairness across all processes.';
    confidence = 70;
    alternatives.push({
      algorithm: 'SJF',
      reasoning: 'If total system throughput is the primary concern'
    });
    alternatives.push({
      algorithm: 'PRIORITY',
      reasoning: 'If some processes are more critical than others'
    });
  }
  
  return {
    recommendedAlgorithm,
    reasoning,
    confidence,
    alternativeAlgorithms: alternatives
  };
}

export function generateWorkload(count: number = 5): Process[] {
  const processes: Process[] = [];
  
  for (let i = 1; i <= count; i++) {
    const arrivalTime = Math.floor(Math.random() * 10);
    const burstTime = Math.floor(Math.random() * 20) + 1;
    const priority = Math.floor(Math.random() * 5) + 1;
    
    processes.push({
      id: i,
      arrivalTime,
      burstTime,
      priority,
      remainingTime: burstTime
    });
  }
  
  return processes;
}

export function generateRealisticWorkload(type: 'interactive' | 'cpu_intensive' | 'mixed' = 'mixed'): Process[] {
  const processes: Process[] = [];
  
  switch (type) {
    case 'interactive':
      // Short burst times, frequent arrivals
      for (let i = 1; i <= 6; i++) {
        processes.push({
          id: i,
          arrivalTime: Math.floor(Math.random() * 5),
          burstTime: Math.floor(Math.random() * 5) + 1,
          priority: Math.floor(Math.random() * 3) + 1,
          remainingTime: 0
        });
      }
      break;
      
    case 'cpu_intensive':
      // Long burst times, less frequent arrivals
      for (let i = 1; i <= 4; i++) {
        processes.push({
          id: i,
          arrivalTime: Math.floor(Math.random() * 8),
          burstTime: Math.floor(Math.random() * 15) + 10,
          priority: Math.floor(Math.random() * 3) + 1,
          remainingTime: 0
        });
      }
      break;
      
    default:
      // Mixed workload
      for (let i = 1; i <= 5; i++) {
        const isCpuIntensive = Math.random() > 0.6;
        processes.push({
          id: i,
          arrivalTime: Math.floor(Math.random() * 8),
          burstTime: isCpuIntensive ? 
            Math.floor(Math.random() * 12) + 8 : 
            Math.floor(Math.random() * 6) + 2,
          priority: Math.floor(Math.random() * 4) + 1,
          remainingTime: 0
        });
      }
  }
  
  // Set remaining time for all processes
  processes.forEach(p => p.remainingTime = p.burstTime);
  
  return processes;
}