import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  apiResponseTime: number;
  resourceLoadTime: number;
  userInteractionTime: number;
  timestamp: number;
  page: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  private metrics: PerformanceMetrics[] = [];
  private navigationStart = 0;
  private currentPage = '';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializePerformanceMonitoring();
    }
  }

  private initializePerformanceMonitoring(): void {
    // Track page navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentPage = event.urlAfterRedirects;
      this.navigationStart = performance.now();
    });

    // Track when page is fully loaded
    window.addEventListener('load', () => {
      this.trackPageLoad();
    });
  }

  // Track page load performance
  private trackPageLoad(): void {
    if (performance.navigation && performance.timing) {
      const timing = performance.timing;
      const navigation = performance.navigation;
      
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      const renderTime = timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart;
      const resourceLoadTime = timing.loadEventEnd - timing.domContentLoadedEventEnd;
      
      this.recordMetrics({
        pageLoadTime,
        renderTime,
        apiResponseTime: 0,
        resourceLoadTime,
        userInteractionTime: 0,
        timestamp: Date.now(),
        page: this.currentPage
      });
    }
  }

  // Track API response time
  trackApiCall(url: string, startTime: number, endTime: number): void {
    const responseTime = endTime - startTime;
    
    this.recordMetrics({
      pageLoadTime: 0,
      renderTime: 0,
      apiResponseTime: responseTime,
      resourceLoadTime: 0,
      userInteractionTime: 0,
      timestamp: Date.now(),
      page: this.currentPage
    });

    // Log slow API calls
    if (responseTime > 2000) {
      console.warn(`Slow API call detected: ${url} took ${responseTime}ms`);
    }
  }

  // Track user interaction performance
  trackUserInteraction(interaction: string, startTime: number, endTime: number): void {
    const interactionTime = endTime - startTime;
    
    this.recordMetrics({
      pageLoadTime: 0,
      renderTime: 0,
      apiResponseTime: 0,
      resourceLoadTime: 0,
      userInteractionTime: interactionTime,
      timestamp: Date.now(),
      page: this.currentPage
    });

    // Log slow interactions
    if (interactionTime > 100) {
      console.warn(`Slow user interaction: ${interaction} took ${interactionTime}ms`);
    }
  }

  // Track Core Web Vitals
  trackCoreWebVitals(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Track Largest Contentful Paint (LCP)
      this.observeLCP();
      
      // Track First Input Delay (FID)
      this.observeFID();
      
      // Track Cumulative Layout Shift (CLS)
      this.observeCLS();
    }
  }

  private observeLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('LCP:', entry.startTime);
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    }
  }

  private observeFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('FID:', (entry as any).processingStart - entry.startTime);
        }
      });
      observer.observe({ type: 'first-input', buffered: true });
    }
  }

  private observeCLS(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        console.log('CLS:', clsValue);
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    }
  }

  // Record performance metrics
  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last 100 entries to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics.splice(0, this.metrics.length - 100);
    }
  }

  // Get performance summary
  getPerformanceSummary(): {
    averagePageLoadTime: number;
    averageApiResponseTime: number;
    averageRenderTime: number;
    slowestPages: string[];
    totalMetrics: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averagePageLoadTime: 0,
        averageApiResponseTime: 0,
        averageRenderTime: 0,
        slowestPages: [],
        totalMetrics: 0
      };
    }

    const pageLoadTimes = this.metrics.filter(m => m.pageLoadTime > 0);
    const apiResponseTimes = this.metrics.filter(m => m.apiResponseTime > 0);
    const renderTimes = this.metrics.filter(m => m.renderTime > 0);

    const averagePageLoadTime = pageLoadTimes.length > 0 
      ? pageLoadTimes.reduce((sum, m) => sum + m.pageLoadTime, 0) / pageLoadTimes.length 
      : 0;

    const averageApiResponseTime = apiResponseTimes.length > 0
      ? apiResponseTimes.reduce((sum, m) => sum + m.apiResponseTime, 0) / apiResponseTimes.length
      : 0;

    const averageRenderTime = renderTimes.length > 0
      ? renderTimes.reduce((sum, m) => sum + m.renderTime, 0) / renderTimes.length
      : 0;

    // Find slowest pages
    const pageMetrics = new Map<string, number[]>();
    pageLoadTimes.forEach(m => {
      if (!pageMetrics.has(m.page)) {
        pageMetrics.set(m.page, []);
      }
      pageMetrics.get(m.page)!.push(m.pageLoadTime);
    });

    const slowestPages = Array.from(pageMetrics.entries())
      .map(([page, times]) => ({
        page,
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5)
      .map(p => p.page);

    return {
      averagePageLoadTime,
      averageApiResponseTime,
      averageRenderTime,
      slowestPages,
      totalMetrics: this.metrics.length
    };
  }

  // Get metrics for a specific page
  getPageMetrics(page: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.page === page);
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }

  // Export metrics for analysis
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}
