import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil } from 'rxjs';

import { TmdbService } from '../../services/tmdb.service';
import { LoadingService } from '../../services/loading.service';
import { ShareService } from '../../services/share.service';
import { FavoritesService } from '../../services/favorites.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Person, PersonDetails, PersonMovieCredits } from '../../models/person.model';
import { Movie } from '../../models/movie.model';
import { FavoritesButtonComponent } from '../../components/shared/favorites-button/favorites-button.component';
import { WatchlistButtonComponent } from '../../components/shared/watchlist-button/watchlist-button.component';
import { MovieCardComponent } from '../../components/shared/movie-card/movie-card.component';

@Component({
  selector: 'app-actor-details',
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatTabsModule,
    FavoritesButtonComponent,
    WatchlistButtonComponent,
    MovieCardComponent
  ],
  templateUrl: './actor-details.component.html',
  styleUrl: './actor-details.component.scss'
})
export class ActorDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  tmdbService = inject(TmdbService);
  loadingService = inject(LoadingService);
  private shareService = inject(ShareService);
  private favoritesService = inject(FavoritesService);
  private analyticsService = inject(AnalyticsService);

  person: PersonDetails | null = null;
  credits: PersonMovieCredits | null = null;
  knownForMovies: Movie[] = [];
  
  private destroy$ = new Subject<void>();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const personId = Number(params['id']);
      if (personId) {
        this.loadPersonDetails(personId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPersonDetails(personId: number): void {
    this.loadingService.setLoading('actor-details', true);
    
    // Load person details and credits in parallel
    Promise.all([
      this.tmdbService.getPersonDetails(personId).toPromise(),
      this.tmdbService.getPersonMovieCredits(personId).toPromise()
    ]).then(([details, credits]) => {
      this.person = details || null;
      this.credits = credits || null;
      this.knownForMovies = credits?.cast?.slice(0, 12) || [];
      
      // Track actor view
      if (this.person) {
        this.analyticsService.trackEvent('actor_view', 'actor_interaction', this.person.name, this.person.id);
      }
      
      this.loadingService.setLoading('actor-details', false);
    }).catch(error => {
      console.error('Failed to load person details:', error);
      this.analyticsService.trackError('actor_details_load_error', '/actor-details');
      this.loadingService.setLoading('actor-details', false);
    });
  }

  shareActor(): void {
    if (this.person) {
      // Convert PersonDetails to Person for sharing
      const personForSharing: Person = {
        id: this.person.id,
        name: this.person.name,
        profile_path: this.person.profile_path,
        adult: this.person.adult,
        popularity: this.person.popularity,
        known_for_department: this.person.known_for_department,
        known_for: [], // Empty array since we don't have this data
        gender: this.person.gender
      };
      
      // Track share event
      this.analyticsService.trackEvent('actor_share', 'actor_interaction', this.person.name, this.person.id);
      
      this.shareService.sharePerson(personForSharing);
    }
  }

  getProfileUrl(): string {
    if (this.person?.profile_path) {
      return this.tmdbService.getImageUrl(this.person.profile_path, 'w500');
    }
    return 'assets/images/no-profile.jpg';
  }

  getAge(): string {
    if (this.person?.birthday) {
      const birthDate = new Date(this.person.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age.toString();
    }
    return 'Unknown';
  }

  getBirthPlace(): string {
    return this.person?.place_of_birth || 'Unknown';
  }

  getBirthday(): string {
    if (this.person?.birthday) {
      return new Date(this.person.birthday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Unknown';
  }

  getKnownFor(): string {
    return this.person?.known_for_department || 'Acting';
  }

  get isLoading(): boolean {
    return this.loadingService.isLoadingKey('actor-details');
  }

  get isFavorite(): boolean {
    return this.person ? this.favoritesService.isFavorite(this.person.id, 'person') : false;
  }

  toggleFavorite(): void {
    if (this.person) {
      // Convert PersonDetails to Person for favorites
      const personForFavorites: Person = {
        id: this.person.id,
        name: this.person.name,
        profile_path: this.person.profile_path,
        adult: this.person.adult,
        popularity: this.person.popularity,
        known_for_department: this.person.known_for_department,
        known_for: [], // Empty array since we don't have this data
        gender: this.person.gender
      };
      this.favoritesService.toggleFavorite(personForFavorites, 'person');
    }
  }

  get notableMovies(): Movie[] {
    return this.knownForMovies.filter(movie => movie.vote_average > 7).slice(0, 6);
  }

  trackByMovieId(index: number, movie: Movie): number {
    return movie.id;
  }

  getPersonForButtons(): Person | undefined {
    if (!this.person) return undefined;
    
    return {
      id: this.person.id,
      name: this.person.name,
      profile_path: this.person.profile_path,
      adult: this.person.adult,
      popularity: this.person.popularity,
      known_for_department: this.person.known_for_department,
      known_for: [], // Empty array since we don't have this data
      gender: this.person.gender
    };
  }
}
