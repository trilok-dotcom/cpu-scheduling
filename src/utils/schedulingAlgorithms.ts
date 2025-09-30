import { Process, SchedulingResult, GanttItem } from '../types/scheduling';

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
];

export function fcfs(processes: Process[]): SchedulingResult {
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const ganttChart: GanttItem[] = [];
  let currentTime = 0;

  sortedProcesses.forEach((process, index) => {
    const startTime = Math.max(currentTime, process.arrivalTime);
    const endTime = startTime + process.burstTime;
    
    ganttChart.push({
      processId: process.id,
      startTime,
      endTime,
      color: COLORS[index % COLORS.length]
    });
    
    process.completionTime = endTime;
    process.turnaroundTime = endTime - process.arrivalTime;
    process.waitingTime = process.turnaroundTime - process.burstTime;
    process.responseTime = startTime - process.arrivalTime;
    
    currentTime = endTime;
  });

  return calculateAverages(sortedProcesses, ganttChart, 'First Come First Serve');
}

export function sjf(processes: Process[], preemptive: boolean = false): SchedulingResult {
  if (!preemptive) {
    return sjfNonPreemptive(processes);
  }
  return sjfPreemptive(processes);
}

function sjfNonPreemptive(processes: Process[]): SchedulingResult {
  const remainingProcesses = [...processes];
  const completedProcesses: Process[] = [];
  const ganttChart: GanttItem[] = [];
  let currentTime = 0;

  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }

    availableProcesses.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
    const selectedProcess = availableProcesses[0];
    
    const startTime = currentTime;
    const endTime = startTime + selectedProcess.burstTime;
    
    ganttChart.push({
      processId: selectedProcess.id,
      startTime,
      endTime,
      color: COLORS[(selectedProcess.id - 1) % COLORS.length]
    });

    selectedProcess.completionTime = endTime;
    selectedProcess.turnaroundTime = endTime - selectedProcess.arrivalTime;
    selectedProcess.waitingTime = selectedProcess.turnaroundTime - selectedProcess.burstTime;
    selectedProcess.responseTime = startTime - selectedProcess.arrivalTime;
    
    completedProcesses.push(selectedProcess);
    remainingProcesses.splice(remainingProcesses.indexOf(selectedProcess), 1);
    currentTime = endTime;
  }

  return calculateAverages(completedProcesses, ganttChart, 'Shortest Job First');
}

function sjfPreemptive(processes: Process[]): SchedulingResult {
  const processQueue = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  const ganttChart: GanttItem[] = [];
  let currentTime = 0;
  let lastProcess: Process | null = null;

  while (processQueue.some(p => p.remainingTime > 0)) {
    const availableProcesses = processQueue.filter(p => 
      p.arrivalTime <= currentTime && p.remainingTime > 0
    );

    if (availableProcesses.length === 0) {
      currentTime++;
      continue;
    }

    availableProcesses.sort((a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime);
    const currentProcess = availableProcesses[0];

    if (lastProcess !== currentProcess) {
      if (lastProcess && ganttChart.length > 0) {
        ganttChart[ganttChart.length - 1].endTime = currentTime;
      }
      
      ganttChart.push({
        processId: currentProcess.id,
        startTime: currentTime,
        endTime: currentTime + 1,
        color: COLORS[(currentProcess.id - 1) % COLORS.length]
      });

      if (currentProcess.responseTime === undefined) {
        currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
      }
    }

    currentProcess.remainingTime--;
    currentTime++;

    if (currentProcess.remainingTime === 0) {
      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime = currentTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
    }

    lastProcess = currentProcess;
  }

  if (ganttChart.length > 0) {
    ganttChart[ganttChart.length - 1].endTime = currentTime;
  }

  return calculateAverages(processQueue, ganttChart, 'Shortest Job First (Preemptive)');
}

export function priorityScheduling(processes: Process[], preemptive: boolean = false): SchedulingResult {
  if (!preemptive) {
    return priorityNonPreemptive(processes);
  }
  return priorityPreemptive(processes);
}

function priorityNonPreemptive(processes: Process[]): SchedulingResult {
  const remainingProcesses = [...processes];
  const completedProcesses: Process[] = [];
  const ganttChart: GanttItem[] = [];
  let currentTime = 0;

  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }

    availableProcesses.sort((a, b) => (a.priority || 0) - (b.priority || 0) || a.arrivalTime - b.arrivalTime);
    const selectedProcess = availableProcesses[0];
    
    const startTime = currentTime;
    const endTime = startTime + selectedProcess.burstTime;
    
    ganttChart.push({
      processId: selectedProcess.id,
      startTime,
      endTime,
      color: COLORS[(selectedProcess.id - 1) % COLORS.length]
    });

    selectedProcess.completionTime = endTime;
    selectedProcess.turnaroundTime = endTime - selectedProcess.arrivalTime;
    selectedProcess.waitingTime = selectedProcess.turnaroundTime - selectedProcess.burstTime;
    selectedProcess.responseTime = startTime - selectedProcess.arrivalTime;
    
    completedProcesses.push(selectedProcess);
    remainingProcesses.splice(remainingProcesses.indexOf(selectedProcess), 1);
    currentTime = endTime;
  }

  return calculateAverages(completedProcesses, ganttChart, 'Priority Scheduling');
}

function priorityPreemptive(processes: Process[]): SchedulingResult {
  const processQueue = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  const ganttChart: GanttItem[] = [];
  let currentTime = 0;
  let lastProcess: Process | null = null;

  while (processQueue.some(p => p.remainingTime > 0)) {
    const availableProcesses = processQueue.filter(p => 
      p.arrivalTime <= currentTime && p.remainingTime > 0
    );

    if (availableProcesses.length === 0) {
      currentTime++;
      continue;
    }

    availableProcesses.sort((a, b) => (a.priority || 0) - (b.priority || 0) || a.arrivalTime - b.arrivalTime);
    const currentProcess = availableProcesses[0];

    if (lastProcess !== currentProcess) {
      if (lastProcess && ganttChart.length > 0) {
        ganttChart[ganttChart.length - 1].endTime = currentTime;
      }
      
      ganttChart.push({
        processId: currentProcess.id,
        startTime: currentTime,
        endTime: currentTime + 1,
        color: COLORS[(currentProcess.id - 1) % COLORS.length]
      });

      if (currentProcess.responseTime === undefined) {
        currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
      }
    }

    currentProcess.remainingTime--;
    currentTime++;

    if (currentProcess.remainingTime === 0) {
      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime = currentTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
    }

    lastProcess = currentProcess;
  }

  if (ganttChart.length > 0) {
    ganttChart[ganttChart.length - 1].endTime = currentTime;
  }

  return calculateAverages(processQueue, ganttChart, 'Priority Scheduling (Preemptive)');
}

export function roundRobin(processes: Process[], timeQuantum: number = 4): SchedulingResult {
  const processQueue = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  const readyQueue: Process[] = [];
  const ganttChart: GanttItem[] = [];
  let currentTime = 0;
  
  // Add processes that arrive at time 0
  processQueue.forEach(p => {
    if (p.arrivalTime === 0) {
      readyQueue.push(p);
    }
  });

  while (readyQueue.length > 0 || processQueue.some(p => p.remainingTime > 0 && p.arrivalTime > currentTime)) {
    // Add newly arrived processes to ready queue
    processQueue.forEach(p => {
      if (p.arrivalTime === currentTime && p.remainingTime > 0 && !readyQueue.includes(p)) {
        readyQueue.push(p);
      }
    });

    if (readyQueue.length === 0) {
      currentTime++;
      continue;
    }

    const currentProcess = readyQueue.shift()!;
    const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);
    
    if (currentProcess.responseTime === undefined) {
      currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
    }

    ganttChart.push({
      processId: currentProcess.id,
      startTime: currentTime,
      endTime: currentTime + executionTime,
      color: COLORS[(currentProcess.id - 1) % COLORS.length]
    });

    currentProcess.remainingTime -= executionTime;
    currentTime += executionTime;

    // Add newly arrived processes during execution
    processQueue.forEach(p => {
      if (p.arrivalTime <= currentTime && p.remainingTime > 0 && !readyQueue.includes(p) && p !== currentProcess) {
        readyQueue.push(p);
      }
    });

    if (currentProcess.remainingTime === 0) {
      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime = currentTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
    } else {
      readyQueue.push(currentProcess);
    }
  }

  return calculateAverages(processQueue, ganttChart, 'Round Robin');
}

function calculateAverages(processes: Process[], ganttChart: GanttItem[], algorithmName: string): SchedulingResult {
  const avgTurnaroundTime = processes.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0) / processes.length;
  const avgWaitingTime = processes.reduce((sum, p) => sum + (p.waitingTime || 0), 0) / processes.length;
  const avgResponseTime = processes.reduce((sum, p) => sum + (p.responseTime || 0), 0) / processes.length;
  const totalTime = Math.max(...ganttChart.map(g => g.endTime));

  return {
    processes: [...processes],
    ganttChart,
    averageTurnaroundTime: Math.round(avgTurnaroundTime * 100) / 100,
    averageWaitingTime: Math.round(avgWaitingTime * 100) / 100,
    averageResponseTime: Math.round(avgResponseTime * 100) / 100,
    totalTime,
    algorithmName
  };
}