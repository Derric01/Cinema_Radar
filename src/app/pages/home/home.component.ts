import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { TmdbService } from '../../services/tmdb.service';
import { LoadingService } from '../../services/loading.service';
import { NotificationService } from '../../services/notification.service';
import { Movie } from '../../models/movie.model';
import { Person } from '../../models/person.model';
import { MovieCardComponent } from '../../components/shared/movie-card/movie-card.component';
import { PersonCardComponent } from '../../components/shared/person-card/person-card.component';
import { LoadingSkeletonComponent } from '../../components/shared/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatGridListModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatBadgeModule,
    RouterModule,
    MovieCardComponent,
    PersonCardComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);

  // Make tmdbService public so template can access it
  public tmdbService = inject(TmdbService);

  // Data properties
  featuredMovie: Movie | null = null;
  trendingMovies: Movie[] = [];
  topRatedMovies: Movie[] = [];
  upcomingMovies: Movie[] = [];
  popularActors: Person[] = [];
  
  // UI state
  isLoading = true;
  selectedCategory = 'trending';
  
  // Categories for navigation
  movieCategories = [
    { id: 'trending', label: 'Trending', icon: 'trending_up' },
    { id: 'top_rated', label: 'Top Rated', icon: 'star' },
    { id: 'upcoming', label: 'Upcoming', icon: 'schedule' }
  ];

  ngOnInit() {
    this.loadHomeData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHomeData() {
    this.loadingService.show('home');
    
    // Load all home page data in parallel
    forkJoin({
      trending: this.tmdbService.getTrendingMovies(),
      topRated: this.tmdbService.getTopRatedMovies(),
      upcoming: this.tmdbService.getUpcomingMovies(),
      popularActors: this.tmdbService.getPopularActors()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.trendingMovies = data.trending.results.slice(0, 12);
        this.topRatedMovies = data.topRated.results.slice(0, 12);
        this.upcomingMovies = data.upcoming.results.slice(0, 12);
        this.popularActors = data.popularActors.results.slice(0, 8);
        
        // Set featured movie as the first trending movie
        this.featuredMovie = this.trendingMovies[0] || null;
        
        this.isLoading = false;
        this.loadingService.hide('home');
      },
      error: (error) => {
        console.error('Error loading home data:', error);
        this.notificationService.error('Failed to load content. Please try again.');
        this.isLoading = false;
        this.loadingService.hide('home');
      }
    });
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
  }

  getCurrentMovies(): Movie[] {
    switch (this.selectedCategory) {
      case 'trending':
        return this.trendingMovies;
      case 'top_rated':
        return this.topRatedMovies;
      case 'upcoming':
        return this.upcomingMovies;
      default:
        return this.trendingMovies;
    }
  }

  getFeaturedMovieBackdrop(): string {
    if (!this.featuredMovie?.backdrop_path) return '';
    return `${this.tmdbService.getImageUrl(this.featuredMovie.backdrop_path, 'original')}`;
  }

  refreshContent() {
    this.loadHomeData();
  }

  // Track by functions for performance
  trackByMovieId(index: number, movie: Movie): number {
    return movie.id;
  }

  trackByPersonId(index: number, person: Person): number {
    return person.id;
  }
}
