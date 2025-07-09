import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FavoritesService } from '../../../services/favorites.service';
import { Movie } from '../../../models/movie.model';
import { Person } from '../../../models/person.model';

@Component({
  selector: 'app-favorites-button',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './favorites-button.component.html',
  styleUrl: './favorites-button.component.scss'
})
export class FavoritesButtonComponent implements OnInit {
  @Input() item?: Movie | Person;
  @Input() type?: 'movie' | 'person';
  @Input() isFavorite = false;
  @Input() disabled = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() favoriteToggled = new EventEmitter<void>();

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit() {
    if (this.item && this.type) {
      this.isFavorite = this.favoritesService.isFavorite(this.item.id, this.type);
    }
  }

  onClick() {
    if (this.item && this.type) {
      this.favoritesService.toggleFavorite(this.item, this.type);
      this.isFavorite = !this.isFavorite;
    }
    this.favoriteToggled.emit();
  }

  get tooltipText(): string {
    return this.isFavorite ? 'Remove from favorites' : 'Add to favorites';
  }

  get iconName(): string {
    return this.isFavorite ? 'favorite' : 'favorite_border';
  }

  onToggle(): void {
    if (!this.disabled) {
      this.favoriteToggled.emit();
    }
  }
}
