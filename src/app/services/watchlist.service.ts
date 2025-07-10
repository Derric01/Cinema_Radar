import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { Person } from '../models/person.model';

export interface WatchlistItem {
  id: number;
  type: 'movie' | 'person';
  data: Movie | Person;
  addedAt: Date;
  status: 'want_to_watch' | 'watching' | 'watched';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private platformId = inject(PLATFORM_ID);

  private readonly WATCHLIST_KEY = 'cinema-radar-watchlist';
  private watchlistSubject = new BehaviorSubject<WatchlistItem[]>(this.loadWatchlist());

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  get watchlist$(): Observable<WatchlistItem[]> {
    return this.watchlistSubject.asObservable();
  }

  get watchlist(): WatchlistItem[] {
    return this.watchlistSubject.value;
  }

  addToWatchlist(
    item: Movie | Person, 
    type: 'movie' | 'person',
    status: 'want_to_watch' | 'watching' | 'watched' = 'want_to_watch',
    priority: 'low' | 'medium' | 'high' = 'medium',
    notes?: string
  ): void {
    const watchlist = this.watchlist;
    const exists = watchlist.some(w => w.id === item.id && w.type === type);
    
    if (!exists) {
      const newItem: WatchlistItem = {
        id: item.id,
        type,
        data: item,
        addedAt: new Date(),
        status,
        priority,
        notes
      };
      
      const updatedWatchlist = [...watchlist, newItem];
      this.updateWatchlist(updatedWatchlist);
    }
  }

  removeFromWatchlist(id: number, type: 'movie' | 'person'): void {
    const watchlist = this.watchlist;
    const updatedWatchlist = watchlist.filter(item => !(item.id === id && item.type === type));
    this.updateWatchlist(updatedWatchlist);
  }

  updateWatchlistItem(id: number, type: 'movie' | 'person', updates: Partial<WatchlistItem>): void {
    const watchlist = this.watchlist;
    const index = watchlist.findIndex(item => item.id === id && item.type === type);
    
    if (index !== -1) {
      const updatedItem = { ...watchlist[index], ...updates };
      const updatedWatchlist = [...watchlist];
      updatedWatchlist[index] = updatedItem;
      this.updateWatchlist(updatedWatchlist);
    }
  }

  isInWatchlist(id: number, type: 'movie' | 'person'): boolean {
    return this.watchlist.some(item => item.id === id && item.type === type);
  }

  getWatchlistItem(id: number, type: 'movie' | 'person'): WatchlistItem | undefined {
    return this.watchlist.find(item => item.id === id && item.type === type);
  }

  getWatchlistByStatus(status: 'want_to_watch' | 'watching' | 'watched'): WatchlistItem[] {
    return this.watchlist.filter(item => item.status === status);
  }

  getWatchlistByPriority(priority: 'low' | 'medium' | 'high'): WatchlistItem[] {
    return this.watchlist.filter(item => item.priority === priority);
  }

  getWatchlistByType(type: 'movie' | 'person'): WatchlistItem[] {
    return this.watchlist.filter(item => item.type === type);
  }

  searchWatchlist(query: string): WatchlistItem[] {
    const searchQuery = query.toLowerCase();
    return this.watchlist.filter(item => {
      const title = item.type === 'movie' 
        ? (item.data as Movie).title.toLowerCase()
        : (item.data as Person).name.toLowerCase();
      return title.includes(searchQuery) || 
             (item.notes && item.notes.toLowerCase().includes(searchQuery));
    });
  }

  getWatchlistStats(): {
    total: number;
    movies: number;
    persons: number;
    wantToWatch: number;
    watching: number;
    watched: number;
  } {
    const watchlist = this.watchlist;
    return {
      total: watchlist.length,
      movies: watchlist.filter(item => item.type === 'movie').length,
      persons: watchlist.filter(item => item.type === 'person').length,
      wantToWatch: watchlist.filter(item => item.status === 'want_to_watch').length,
      watching: watchlist.filter(item => item.status === 'watching').length,
      watched: watchlist.filter(item => item.status === 'watched').length
    };
  }

  clearWatchlist(): void {
    this.updateWatchlist([]);
  }

  private loadWatchlist(): WatchlistItem[] {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem(this.WATCHLIST_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }));
        }
      } catch (error) {
        console.error('Error loading watchlist from localStorage:', error);
      }
    }
    return [];
  }

  private updateWatchlist(watchlist: WatchlistItem[]): void {
    this.watchlistSubject.next(watchlist);
    this.saveWatchlist(watchlist);
  }

  private saveWatchlist(watchlist: WatchlistItem[]): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
      } catch (error) {
        console.error('Error saving watchlist to localStorage:', error);
      }
    }
  }
}
