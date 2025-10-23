/**
 * Custom Test Sequencer
 * Controls the order in which tests are executed
 *
 * Order: Smoke -> API -> Integration -> E2E -> Performance
 */
import Sequencer from '@jest/test-sequencer';

class CustomTestSequencer extends Sequencer {
  sort(tests) {
    // Define test priority (lower number = runs first)
    const getPriority = (testPath) => {
      if (testPath.includes('/smoke/')) return 1;
      if (testPath.includes('/api/')) return 2;
      if (testPath.includes('/integration/')) return 3;
      if (testPath.includes('/e2e/')) return 4;
      if (testPath.includes('/performance/')) return 5;
      return 6;
    };

    // Sort tests by priority, then alphabetically
    const sortedTests = tests.sort((testA, testB) => {
      const priorityA = getPriority(testA.path);
      const priorityB = getPriority(testB.path);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Same priority - sort alphabetically
      return testA.path.localeCompare(testB.path);
    });

    return sortedTests;
  }
}

export default CustomTestSequencer;
