export interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  remainingTime: number;
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
  responseTime?: number;
}

export interface SchedulingResult {
  processes: Process[];
  ganttChart: GanttItem[];
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  totalTime: number;
  algorithmName: string;
}

export interface GanttItem {
  processId: number;
  startTime: number;
  endTime: number;
  color: string;
}

export interface Resource {
  id: number;
  name: string;
  totalInstances: number;
  availableInstances: number;
}

export interface AllocationMatrix {
  processId: number;
  allocations: number[];
  maxNeeds: number[];
  needs: number[];
}

export interface DeadlockResult {
  isSafe: boolean;
  safeSequence?: number[];
  message: string;
  steps: string[];
}

export type SchedulingAlgorithm = 'FCFS' | 'SJF' | 'SJF_PREEMPTIVE' | 'PRIORITY' | 'PRIORITY_PREEMPTIVE' | 'ROUND_ROBIN';