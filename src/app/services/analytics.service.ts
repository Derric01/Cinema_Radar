import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: any;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private gtag?: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.gtag = (window as any).gtag || function () { 
        ((window as any).gtag.q = (window as any).gtag.q || []).push(arguments); 
      };
      this.initializeAnalytics();
    }
  }

  private initializeAnalytics(): void {
    // Track page views
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  // Track page views
  trackPageView(url: string): void {
    if (isPlatformBrowser(this.platformId) && this.gtag) {
      this.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: url
      });
    }
  }

  // Track custom events
  trackEvent(eventName: string, eventCategory: string, eventLabel?: string, value?: number): void {
    if (isPlatformBrowser(this.platformId) && this.gtag) {
      this.gtag('event', eventName, {
        event_category: eventCategory,
        event_label: eventLabel,
        value: value
      });
    }
  }

  // Track movie interactions
  trackMovieView(movieId: number, movieTitle: string): void {
    this.trackEvent('movie_view', 'movie_interaction', movieTitle, movieId);
  }

  trackMovieShare(movieId: number, movieTitle: string, shareMethod: string): void {
    this.trackEvent('movie_share', 'movie_interaction', `${movieTitle} - ${shareMethod}`, movieId);
  }

  trackMovieFavorite(movieId: number, movieTitle: string, action: 'add' | 'remove'): void {
    this.trackEvent('movie_favorite', 'movie_interaction', `${movieTitle} - ${action}`, movieId);
  }

  // Track search interactions
  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent('search', 'search_interaction', query, resultsCount);
  }

  // Track user engagement
  trackFeatureUsage(feature: string, action: string): void {
    this.trackEvent('feature_usage', 'user_engagement', `${feature} - ${action}`);
  }

  // Track performance
  trackPerformance(metric: string, value: number): void {
    this.trackEvent('performance', 'performance_metrics', metric, value);
  }

  // Track errors
  trackError(error: string, page: string): void {
    this.trackEvent('error', 'error_tracking', `${page} - ${error}`);
  }
}
