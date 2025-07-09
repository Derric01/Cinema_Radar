import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

import { Person } from '../../../models/person.model';
import { TmdbService } from '../../../services/tmdb.service';
import { FavoritesService } from '../../../services/favorites.service';
import { ShareService } from '../../../services/share.service';
import { CardGeneratorService } from '../../../services/card-generator.service';
import { NotificationService } from '../../../services/notification.service';
import { FavoritesButtonComponent } from '../favorites-button/favorites-button.component';

@Component({
  selector: 'app-person-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    RouterModule,
    FavoritesButtonComponent
  ],
  templateUrl: './person-card.component.html',
  styleUrl: './person-card.component.scss'
})
export class PersonCardComponent {
  @Input({ required: true }) person!: Person;
  @Input() showActions = true;
  @Input() compact = false;

  private tmdbService = inject(TmdbService);
  private favoritesService = inject(FavoritesService);
  private shareService = inject(ShareService);
  private cardGeneratorService = inject(CardGeneratorService);
  private notificationService = inject(NotificationService);

  isGeneratingCard = false;

  get profileUrl(): string {
    return this.tmdbService.getImageUrl(this.person.profile_path);
  }

  get knownFor(): string {
    return this.person.known_for_department || 'Acting';
  }

  get popularityScore(): number {
    return Math.round(this.person.popularity || 0);
  }

  get isFavorite(): boolean {
    return this.favoritesService.isPersonFavorite(this.person.id);
  }

  toggleFavorite(): void {
    this.favoritesService.togglePersonFavorite(this.person);
  }

  sharePerson(): void {
    this.shareService.sharePerson(this.person);
  }

  async downloadCard(): Promise<void> {
    try {
      this.isGeneratingCard = true;
      const blob = await this.cardGeneratorService.generatePersonCard(this.person);
      const filename = `${this.person.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_card.png`;
      this.cardGeneratorService.downloadCard(blob, filename);
      this.notificationService.success('Actor card downloaded successfully!');
    } catch (error) {
      console.error('Error generating person card:', error);
      this.notificationService.error('Failed to generate actor card. Please try again.');
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
}
