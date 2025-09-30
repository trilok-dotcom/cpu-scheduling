import { Resource, AllocationMatrix, DeadlockResult } from '../types/scheduling';

export function bankersAlgorithm(
  resources: Resource[],
  allocations: AllocationMatrix[]
): DeadlockResult {
  const n = allocations.length; // Number of processes
  const m = resources.length; // Number of resource types
  
  // Available resources
  const available = resources.map(r => r.availableInstances);
  
  // Work array (copy of available)
  const work = [...available];
  
  // Finish array
  const finish = new Array(n).fill(false);
  
  // Safe sequence
  const safeSequence: number[] = [];
  
  // Steps for visualization
  const steps: string[] = [];
  
  steps.push(`Initial state:`);
  steps.push(`Available resources: [${available.join(', ')}]`);
  
  // Calculate need matrix
  allocations.forEach(alloc => {
    alloc.needs = alloc.maxNeeds.map((max, i) => max - alloc.allocations[i]);
  });
  
  let foundProcess = true;
  let iteration = 0;
  
  while (foundProcess && safeSequence.length < n) {
    foundProcess = false;
    iteration++;
    
    steps.push(`\nIteration ${iteration}:`);
    steps.push(`Work: [${work.join(', ')}]`);
    
    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        const process = allocations[i];
        const canAllocate = process.needs.every((need, j) => need <= work[j]);
        
        if (canAllocate) {
          // Process can complete
          finish[i] = true;
          safeSequence.push(process.processId);
          
          // Release resources
          process.allocations.forEach((alloc, j) => {
            work[j] += alloc;
          });
          
          steps.push(`Process P${process.processId} can complete`);
          steps.push(`Resources released: [${process.allocations.join(', ')}]`);
          steps.push(`New work: [${work.join(', ')}]`);
          
          foundProcess = true;
          break;
        }
      }
    }
  }
  
  const isSafe = safeSequence.length === n;
  
  if (isSafe) {
    steps.push(`\nSystem is in safe state`);
    steps.push(`Safe sequence: P${safeSequence.join(' -> P')}`);
    return {
      isSafe: true,
      safeSequence,
      message: `System is in safe state. Safe sequence: P${safeSequence.join(' -> P')}`,
      steps
    };
  } else {
    steps.push(`\nSystem is in deadlock state`);
    steps.push(`No safe sequence exists`);
    return {
      isSafe: false,
      message: 'System is in deadlock state. No safe sequence exists.',
      steps
    };
  }
}

export function detectDeadlock(
  resources: Resource[],
  allocations: AllocationMatrix[]
): DeadlockResult {
  return bankersAlgorithm(resources, allocations);
}