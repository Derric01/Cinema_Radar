import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil } from 'rxjs';

import { WatchlistService, WatchlistItem } from '../../services/watchlist.service';
import { AnalyticsService } from '../../services/analytics.service';
import { MovieCardComponent } from '../../components/shared/movie-card/movie-card.component';
import { PersonCardComponent } from '../../components/shared/person-card/person-card.component';
import { Movie } from '../../models/movie.model';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatBadgeModule,
    MovieCardComponent,
    PersonCardComponent
  ],
  template: `
    <div class="watchlist-container">
      <!-- Header -->
      <div class="watchlist-header">
        <h1>
          <mat-icon>bookmark</mat-icon>
          My Watchlist
        </h1>
        <p class="subtitle">Keep track of movies you want to watch and actors you follow</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">movie</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ stats.movies }}</span>
                <span class="stat-label">Movies</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">people</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ stats.persons }}</span>
                <span class="stat-label">Actors</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">check_circle</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ stats.watched }}</span>
                <span class="stat-label">Watched</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <mat-form-field appearance="outline">
          <mat-label>Search watchlist</mat-label>
          <input matInput [(ngModel)]="searchQuery" (ngModelChange)="filterItems()" placeholder="Search movies or actors...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Filter by status</mat-label>
          <mat-select [(value)]="statusFilter" (selectionChange)="filterItems()">
            <mat-option value="all">All Items</mat-option>
            <mat-option value="want_to_watch">Want to Watch</mat-option>
            <mat-option value="watching">Currently Watching</mat-option>
            <mat-option value="watched">Already Watched</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Filter by priority</mat-label>
          <mat-select [(value)]="priorityFilter" (selectionChange)="filterItems()">
            <mat-option value="all">All Priorities</mat-option>
            <mat-option value="high">High Priority</mat-option>
            <mat-option value="medium">Medium Priority</mat-option>
            <mat-option value="low">Low Priority</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-raised-button color="warn" (click)="clearWatchlist()" [disabled]="watchlistItems.length === 0">
          <mat-icon>clear_all</mat-icon>
          Clear All
        </button>
      </div>

      <!-- Content Tabs -->
      <mat-tab-group [(selectedIndex)]="activeTab" (selectedTabChange)="onTabChange($event)">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>view_list</mat-icon>
            All Items
            <span matBadge="{{ filteredItems.length }}" matBadgePosition="after" matBadgeSize="small" class="tab-badge"></span>
          </ng-template>
          
          <div class="tab-content">
            <div *ngIf="filteredItems.length === 0" class="empty-state">
              <mat-icon class="empty-icon">bookmark_border</mat-icon>
              <h3>No items in your watchlist</h3>
              <p>Start adding movies and actors to your watchlist to keep track of what you want to watch!</p>
            </div>

            <div *ngIf="filteredItems.length > 0" class="watchlist-grid">
              <div *ngFor="let item of filteredItems; trackBy: trackByItem" class="watchlist-item">
                <app-movie-card 
                  *ngIf="item.type === 'movie'"
                  [movie]="getMovieData(item)"
                  [showActions]="true">
                </app-movie-card>
                
                <app-person-card 
                  *ngIf="item.type === 'person'"
                  [person]="getPersonData(item)"
                  [showActions]="true">
                </app-person-card>
                
                <div class="item-status">
                  <mat-chip-set>
                    <mat-chip [color]="getStatusColor(item.status)" selected>
                      <mat-icon>{{ getStatusIcon(item.status) }}</mat-icon>
                      {{ getStatusLabel(item.status) }}
                    </mat-chip>
                    <mat-chip [color]="getPriorityColor(item.priority)" selected>
                      {{ item.priority | titlecase }} Priority
                    </mat-chip>
                  </mat-chip-set>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>movie</mat-icon>
            Movies
            <span matBadge="{{ movieItems.length }}" matBadgePosition="after" matBadgeSize="small" class="tab-badge"></span>
          </ng-template>
          
          <div class="tab-content">
            <div *ngIf="movieItems.length === 0" class="empty-state">
              <mat-icon class="empty-icon">movie</mat-icon>
              <h3>No movies in your watchlist</h3>
              <p>Add movies to track what you want to watch!</p>
            </div>

            <div *ngIf="movieItems.length > 0" class="movies-grid">
              <div *ngFor="let item of movieItems; trackBy: trackByItem" class="movie-item">
                <app-movie-card 
                  [movie]="getMovieData(item)"
                  [showActions]="true">
                </app-movie-card>
              </div>
            </div>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>people</mat-icon>
            Actors
            <span matBadge="{{ personItems.length }}" matBadgePosition="after" matBadgeSize="small" class="tab-badge"></span>
          </ng-template>
          
          <div class="tab-content">
            <div *ngIf="personItems.length === 0" class="empty-state">
              <mat-icon class="empty-icon">people</mat-icon>
              <h3>No actors in your watchlist</h3>
              <p>Add actors to follow their latest movies!</p>
            </div>

            <div *ngIf="personItems.length > 0" class="actors-grid">
              <div *ngFor="let item of personItems; trackBy: trackByItem" class="actor-item">
                <app-person-card 
                  [person]="getPersonData(item)"
                  [showActions]="true">
                </app-person-card>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .watchlist-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .watchlist-header {
      text-align: center;
      margin-bottom: 2rem;
      
      h1 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        color: var(--primary-color);
      }
      
      .subtitle {
        color: var(--text-secondary-color);
        font-size: 1.1rem;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .stat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: var(--primary-color);
      }
      
      .stat-info {
        display: flex;
        flex-direction: column;
        
        .stat-number {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary-color);
        }
        
        .stat-label {
          color: var(--text-secondary-color);
          font-size: 0.9rem;
        }
      }
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
      flex-wrap: wrap;
      
      mat-form-field {
        min-width: 200px;
      }
    }

    .tab-content {
      padding: 2rem 0;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary-color);
      
      .empty-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }
      
      h3 {
        margin-bottom: 1rem;
      }
    }

    .watchlist-grid, .movies-grid, .actors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }

    .watchlist-item, .movie-item, .actor-item {
      position: relative;
    }

    .item-status {
      margin-top: 1rem;
      
      mat-chip-set {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
    }

    .tab-badge {
      margin-left: 0.5rem;
    }

    @media (max-width: 768px) {
      .watchlist-container {
        padding: 1rem;
      }
      
      .filters-section {
        flex-direction: column;
        align-items: stretch;
        
        mat-form-field {
          min-width: auto;
        }
      }
      
      .watchlist-grid, .movies-grid, .actors-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }
    }
  `]
})
export class WatchlistComponent implements OnInit, OnDestroy {
  private watchlistService = inject(WatchlistService);
  private analyticsService = inject(AnalyticsService);

  private destroy$ = new Subject<void>();
  
  watchlistItems: WatchlistItem[] = [];
  filteredItems: WatchlistItem[] = [];
  movieItems: WatchlistItem[] = [];
  personItems: WatchlistItem[] = [];
  
  searchQuery = '';
  statusFilter = 'all';
  priorityFilter = 'all';
  activeTab = 0;
  
  stats = {
    total: 0,
    movies: 0,
    persons: 0,
    wantToWatch: 0,
    watching: 0,
    watched: 0
  };

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    this.loadWatchlist();
    this.analyticsService.trackPageView('/watchlist');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWatchlist() {
    this.watchlistService.watchlist$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.watchlistItems = items;
      this.movieItems = items.filter(item => item.type === 'movie');
      this.personItems = items.filter(item => item.type === 'person');
      this.stats = this.watchlistService.getWatchlistStats();
      this.filterItems();
    });
  }

  filterItems() {
    let filtered = this.watchlistItems;

    // Filter by search query
    if (this.searchQuery.trim()) {
      filtered = this.watchlistService.searchWatchlist(this.searchQuery);
    }

    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === this.statusFilter);
    }

    // Filter by priority
    if (this.priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === this.priorityFilter);
    }

    this.filteredItems = filtered;
  }

  onTabChange(event: any) {
    this.activeTab = event.index;
    this.analyticsService.trackEvent('watchlist_tab_change', 'user_interface', `tab_${event.index}`);
  }

  clearWatchlist() {
    if (confirm('Are you sure you want to clear your entire watchlist? This action cannot be undone.')) {
      this.watchlistService.clearWatchlist();
      this.analyticsService.trackEvent('watchlist_cleared', 'user_action', 'clear_all');
    }
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'want_to_watch': return 'primary';
      case 'watching': return 'accent';
      case 'watched': return 'warn';
      default: return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'want_to_watch': return 'bookmark_add';
      case 'watching': return 'play_circle';
      case 'watched': return 'check_circle';
      default: return 'bookmark';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'want_to_watch': return 'Want to Watch';
      case 'watching': return 'Watching';
      case 'watched': return 'Watched';
      default: return status;
    }
  }

  getPriorityColor(priority: string): 'primary' | 'accent' | 'warn' {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      case 'low': return 'primary';
      default: return 'primary';
    }
  }

  getMovieData(item: WatchlistItem): Movie {
    return item.data as Movie;
  }

  getPersonData(item: WatchlistItem): Person {
    return item.data as Person;
  }

  trackByItem(index: number, item: WatchlistItem): string {
    return `${item.type}-${item.id}`;
  }
}
