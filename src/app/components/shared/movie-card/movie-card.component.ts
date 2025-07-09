import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

import { Movie } from '../../../models/movie.model';
import { TmdbService } from '../../../services/tmdb.service';
import { FavoritesService } from '../../../services/favorites.service';
import { ShareService } from '../../../services/share.service';
import { CardGeneratorService } from '../../../services/card-generator.service';
import { NotificationService } from '../../../services/notification.service';
import { FavoritesButtonComponent } from '../favorites-button/favorites-button.component';
import { WatchlistButtonComponent } from '../watchlist-button/watchlist-button.component';

@Component({
  selector: 'app-movie-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    RouterModule,
    FavoritesButtonComponent,
    WatchlistButtonComponent
  ],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: Movie;
  @Input() showActions = true;
  @Input() compact = false;

  private tmdbService = inject(TmdbService);
  private favoritesService = inject(FavoritesService);
  private shareService = inject(ShareService);
  private cardGeneratorService = inject(CardGeneratorService);
  private notificationService = inject(NotificationService);

  isGeneratingCard = false;

  get posterUrl(): string {
    return this.tmdbService.getImageUrl(this.movie.poster_path);
  }

  get rating(): number {
    return this.movie.vote_average;
  }

  get year(): string {
    return this.movie.release_date ? new Date(this.movie.release_date).getFullYear().toString() : '';
  }

  get genres(): string {
    if (!this.movie.genre_ids) return '';
    return this.tmdbService.getGenreNames(this.movie.genre_ids).slice(0, 2).join(', ');
  }

  get isFavorite(): boolean {
    return this.favoritesService.isMovieFavorite(this.movie.id);
  }

  toggleFavorite(): void {
    this.favoritesService.toggleMovieFavorite(this.movie);
  }

  shareMovie(): void {
    this.shareService.shareMovie(this.movie);
  }

  async downloadCard(): Promise<void> {
    try {
      this.isGeneratingCard = true;
      await this.cardGeneratorService.generateMovieCard(this.movie);
      this.notificationService.success('Movie card downloaded successfully!');
    } catch (error) {
      console.error('Error generating movie card:', error);
      this.notificationService.error('Failed to generate movie card. Please try again.');
    } finally {
      this.isGeneratingCard = false;
    }
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/no-image-placeholder.jpg';
  }

  onImageLoad(event: any): void {
    event.target.classList.add('loaded');
  }

  onWatchlistToggled(): void {
    // Optional: Handle any additional logic when watchlist is toggled
    // For example, you might want to refresh data or show a notification
  }
}
