import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil } from 'rxjs';

import { TmdbService } from '../../services/tmdb.service';
import { LoadingService } from '../../services/loading.service';
import { ShareService } from '../../services/share.service';
import { CardGeneratorService } from '../../services/card-generator.service';
import { Movie, MovieDetails, MovieCredits, CastMember, CrewMember } from '../../models/movie.model';
import { Person } from '../../models/person.model';
import { FavoritesButtonComponent } from '../../components/shared/favorites-button/favorites-button.component';
import { MovieCardComponent } from '../../components/shared/movie-card/movie-card.component';
import { ShareDialogComponent } from '../../components/shared/share-dialog/share-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-movie-details',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTabsModule,
    FavoritesButtonComponent,
    MovieCardComponent
  ],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss'
})
export class MovieDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tmdbService = inject(TmdbService);
  private loadingService = inject(LoadingService);
  private shareService = inject(ShareService);
  private cardGeneratorService = inject(CardGeneratorService);
  private dialog = inject(MatDialog);

  movie: MovieDetails | null = null;
  credits: MovieCredits | null = null;
  similarMovies: Movie[] = [];
  recommendations: Movie[] = [];
  
  private destroy$ = new Subject<void>();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const movieId = +params['id'];
      if (movieId) {
        this.loadMovieDetails(movieId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMovieDetails(movieId: number): void {
    this.loadingService.setLoading('movie-details', true);
    
    // Load movie details, credits, and related movies in parallel
    Promise.all([
      this.tmdbService.getMovieDetails(movieId).toPromise(),
      this.tmdbService.getMovieCredits(movieId).toPromise(),
      this.tmdbService.getSimilarMovies(movieId).toPromise()
    ]).then(([details, credits, similar]) => {
      this.movie = details || null;
      this.credits = credits || null;
      this.similarMovies = similar?.results || [];
      this.loadingService.setLoading('movie-details', false);
    }).catch(error => {
      console.error('Failed to load movie details:', error);
      this.loadingService.setLoading('movie-details', false);
      // Optionally navigate back or show error
    });
  }

  shareMovie(): void {
    if (this.movie) {
      const dialogRef = this.dialog.open(ShareDialogComponent, {
        data: {
          type: 'movie',
          item: this.movie,
          url: window.location.href
        },
        width: '400px',
        maxWidth: '90vw'
      });
    }
  }

  async downloadMovieCard(): Promise<void> {
    if (this.movie) {
      try {
        const blob = await this.cardGeneratorService.generateMovieCard(this.movie, 'modern');
        const filename = `${this.movie.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_card.png`;
        this.cardGeneratorService.downloadCard(blob, filename);
      } catch (error) {
        console.error('Failed to download movie card:', error);
        // Could add notification here
      }
    }
  }

  goToActorDetails(personId: number): void {
    this.router.navigate(['/actor', personId]);
  }

  goToMovieDetails(movieId: number): void {
    this.router.navigate(['/movie', movieId]);
  }

  get isLoading(): boolean {
    return this.loadingService.isLoadingKey('movie-details');
  }

  get moviePosterUrl(): string {
    return this.movie?.poster_path 
      ? `https://image.tmdb.org/t/p/w500${this.movie.poster_path}`
      : 'assets/images/no-poster.png';
  }

  get movieBackdropUrl(): string {
    return this.movie?.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${this.movie.backdrop_path}`
      : '';
  }

  get runtime(): string {
    if (!this.movie?.runtime) return 'N/A';
    const hours = Math.floor(this.movie.runtime / 60);
    const minutes = this.movie.runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  get releaseYear(): string {
    return this.movie?.release_date ? new Date(this.movie.release_date).getFullYear().toString() : 'N/A';
  }

  get genres(): string {
    return this.movie?.genres?.map(g => g.name).join(', ') || 'N/A';
  }

  get director(): CrewMember | undefined {
    return this.credits?.crew.find(person => person.job === 'Director');
  }

  get writers(): CrewMember[] {
    return this.credits?.crew.filter(person => 
      ['Writer', 'Screenplay', 'Story'].includes(person.job || '')
    ) || [];
  }

  get mainCast(): CastMember[] {
    return this.credits?.cast.slice(0, 12) || [];
  }

  get productionCompanies(): string {
    return this.movie?.production_companies?.map(c => c.name).join(', ') || 'N/A';
  }

  trackByPersonId(index: number, person: Person): number {
    return person.id;
  }

  trackByMovieId(index: number, movie: Movie): number {
    return movie.id;
  }

  // Template helper methods
  getBackdropUrl(): string {
    if (this.movie?.backdrop_path) {
      return this.tmdbService.getImageUrl(this.movie.backdrop_path, 'w1280');
    }
    return '';
  }

  getPosterUrl(): string {
    if (this.movie?.poster_path) {
      return this.tmdbService.getImageUrl(this.movie.poster_path, 'w500');
    }
    return 'assets/images/no-poster.jpg';
  }

  getProfileUrl(profilePath: string | null): string {
    if (profilePath) {
      return this.tmdbService.getImageUrl(profilePath, 'w185');
    }
    return 'assets/images/no-profile.jpg';
  }

  getYear(): string {
    if (this.movie?.release_date) {
      return new Date(this.movie.release_date).getFullYear().toString();
    }
    return 'N/A';
  }

  getRuntime(): string {
    if (this.movie?.runtime) {
      const hours = Math.floor(this.movie.runtime / 60);
      const minutes = this.movie.runtime % 60;
      return `${hours}h ${minutes}m`;
    }
    return 'N/A';
  }

  getCertification(): string {
    // This would need to be fetched from release dates API
    return 'PG-13'; // Default placeholder
  }

  getReleaseDate(): string {
    if (this.movie?.release_date) {
      return new Date(this.movie.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'N/A';
  }

  getBudget(): string {
    if (this.movie?.budget && this.movie.budget > 0) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(this.movie.budget);
    }
    return 'N/A';
  }

  getRevenue(): string {
    if (this.movie?.revenue && this.movie.revenue > 0) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(this.movie.revenue);
    }
    return 'N/A';
  }

  getOriginalLanguage(): string {
    const languageMap: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ru': 'Russian',
      'pt': 'Portuguese'
    };
    return languageMap[this.movie?.original_language || ''] || this.movie?.original_language || 'N/A';
  }

  getGenres(): string {
    return this.movie?.genres?.map(g => g.name).join(', ') || 'N/A';
  }

  getWritersNames(): string {
    return this.writers.map(w => w.name).join(', ');
  }
}
