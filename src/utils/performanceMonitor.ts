/**
 * Performance Monitoring Utilities
 * 
 * Use these utilities to track and optimize game performance:
 * - FPS monitoring
 * - Memory usage tracking
 * - Render time profiling
 * - State change frequency analysis
 */

class PerformanceMonitor {
  private fpsHistory: number[] = [];
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private isMonitoring: boolean = false;
  private animationFrameId: number | null = null;

  startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.measureFPS();
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private measureFPS = () => {
    if (!this.isMonitoring) return;

    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / elapsed);
      this.fpsHistory.push(fps);
      
      // Keep only last 60 samples (1 minute at 1 sample/sec)
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }

      // Log performance warnings
      if (fps < 30) {
        console.warn(`⚠️ Low FPS detected: ${fps}`);
      }

      this.frameCount = 0;
      this.lastFrameTime = now;
    }

    this.animationFrameId = requestAnimationFrame(this.measureFPS);
  };

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  getMinFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return Math.min(...this.fpsHistory);
  }

  getMaxFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return Math.max(...this.fpsHistory);
  }

  getMemoryUsage(): { used: number; limit: number } | null {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return {
        used: Math.round(mem.usedJSHeapSize / 1048576), // MB
        limit: Math.round(mem.jsHeapSizeLimit / 1048576), // MB
      };
    }
    return null;
  }

  getPerformanceReport(): string {
    const avgFPS = this.getAverageFPS();
    const minFPS = this.getMinFPS();
    const maxFPS = this.getMaxFPS();
    const memory = this.getMemoryUsage();

    let report = `
╔═══════════════════════════════════╗
║   Performance Monitor Report     ║
╠═══════════════════════════════════╣
║ Average FPS: ${avgFPS.toString().padEnd(18)} ║
║ Min FPS:     ${minFPS.toString().padEnd(18)} ║
║ Max FPS:     ${maxFPS.toString().padEnd(18)} ║
`;

    if (memory) {
      report += `║ Memory Used: ${memory.used} MB / ${memory.limit} MB ${''.padEnd(Math.max(0, 6 - memory.used.toString().length - memory.limit.toString().length))} ║
`;
    }

    report += `╚═══════════════════════════════════╝`;

    return report;
  }

  logReport() {
    console.log(this.getPerformanceReport());
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for performance monitoring
export function usePerformanceMonitor(enabled: boolean = false) {
  if (typeof window === 'undefined') return null;

  if (enabled) {
    performanceMonitor.startMonitoring();
  } else {
    performanceMonitor.stopMonitoring();
  }

  return performanceMonitor;
}

// Utility to measure function execution time
export function measureExecutionTime<T>(
  fn: () => T,
  label: string = 'Function'
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = (end - start).toFixed(2);

  if (parseFloat(duration) > 16.67) {
    // Longer than one frame (60fps)
    console.warn(`⚠️ ${label} took ${duration}ms (>16.67ms)`);
  } else {
    console.log(`✓ ${label} took ${duration}ms`);
  }

  return result;
}

// Debounce utility for React state updates
export function createDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for event handlers
export function createThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
