import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'cinema-radar-theme';
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.applyTheme(this.themeSubject.value);
  }

  get currentTheme$(): Observable<Theme> {
    return this.themeSubject.asObservable();
  }

  get currentTheme(): Theme {
    return this.themeSubject.value;
  }

  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  private getInitialTheme(): Theme {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
      if (savedTheme) {
        return savedTheme;
      }

      // Check system preference
      if (window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    }

    return 'dark'; // Default to dark theme for cinema experience
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const body = document.body;
      body.classList.remove('light-theme', 'dark-theme');
      body.classList.add(`${theme}-theme`);
      
      // Update meta theme-color for mobile browsers
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeColorMeta);
      }
      
      const themeColor = theme === 'dark' ? '#121212' : '#ffffff';
      themeColorMeta.setAttribute('content', themeColor);
    }
  }
}
