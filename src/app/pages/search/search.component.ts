import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { TmdbService } from '../../services/tmdb.service';
import { LoadingService } from '../../services/loading.service';
import { Movie } from '../../models/movie.model';
import { Person } from '../../models/person.model';
import { MovieCardComponent } from '../../components/shared/movie-card/movie-card.component';
import { PersonCardComponent } from '../../components/shared/person-card/person-card.component';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MovieCardComponent,
    PersonCardComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  movies: Movie[] = [];
  persons: Person[] = [];
  activeTab = 0;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private tmdbService: TmdbService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.trim()) {
        this.performSearch(query);
      } else {
        this.clearResults();
      }
    });
  }

  ngOnInit(): void {
    // Check for query parameter
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.performSearch(this.searchQuery);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
    // Update URL without triggering navigation
    this.router.navigate([], {
      queryParams: this.searchQuery ? { q: this.searchQuery } : {},
      queryParamsHandling: 'merge'
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.clearResults();
    this.router.navigate([], { queryParams: {} });
  }

  private performSearch(query: string): void {
    this.loadingService.setLoading('search', true);
    
    // Search movies and persons in parallel
    Promise.all([
      this.tmdbService.searchMovies(query).toPromise(),
      this.tmdbService.searchPeople(query).toPromise()
    ]).then(([moviesResult, personsResult]) => {
      this.movies = moviesResult?.results || [];
      this.persons = personsResult?.results || [];
      this.loadingService.setLoading('search', false);
    }).catch(error => {
      console.error('Search failed:', error);
      this.clearResults();
      this.loadingService.setLoading('search', false);
    });
  }

  private clearResults(): void {
    this.movies = [];
    this.persons = [];
  }

  get isLoading(): boolean {
    return this.loadingService.isLoadingKey('search');
  }

  get hasResults(): boolean {
    return this.movies.length > 0 || this.persons.length > 0;
  }

  get hasMovies(): boolean {
    return this.movies.length > 0;
  }

  get hasPersons(): boolean {
    return this.persons.length > 0;
  }

  trackByMovieId(index: number, movie: Movie): number {
    return movie.id;
  }

  trackByPersonId(index: number, person: Person): number {
    return person.id;
  }
}
