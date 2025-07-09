import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { WatchlistService, WatchlistItem } from '../../../services/watchlist.service';
import { Movie } from '../../../models/movie.model';
import { Person } from '../../../models/person.model';

@Component({
  selector: 'app-watchlist-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <button 
      mat-icon-button 
      [matTooltip]="tooltipText"
      [matMenuTriggerFor]="watchlistMenu"
      [disabled]="disabled"
      class="watchlist-button"
      [class.in-watchlist]="isInWatchlist">
      <mat-icon>{{ iconName }}</mat-icon>
    </button>

    <mat-menu #watchlistMenu="matMenu">
      <ng-container *ngIf="!isInWatchlist">
        <button mat-menu-item (click)="addToWatchlist('want_to_watch', 'medium')">
          <mat-icon>bookmark_add</mat-icon>
          <span>Want to Watch</span>
        </button>
        <button mat-menu-item (click)="addToWatchlist('watching', 'high')">
          <mat-icon>play_circle</mat-icon>
          <span>Currently Watching</span>
        </button>
        <button mat-menu-item (click)="addToWatchlist('watched', 'low')">
          <mat-icon>check_circle</mat-icon>
          <span>Already Watched</span>
        </button>
      </ng-container>
      
      <ng-container *ngIf="isInWatchlist">
        <button mat-menu-item (click)="updateStatus('want_to_watch')" 
                [disabled]="watchlistItem?.status === 'want_to_watch'">
          <mat-icon>bookmark_add</mat-icon>
          <span>Want to Watch</span>
        </button>
        <button mat-menu-item (click)="updateStatus('watching')"
                [disabled]="watchlistItem?.status === 'watching'">
          <mat-icon>play_circle</mat-icon>
          <span>Currently Watching</span>
        </button>
        <button mat-menu-item (click)="updateStatus('watched')"
                [disabled]="watchlistItem?.status === 'watched'">
          <mat-icon>check_circle</mat-icon>
          <span>Already Watched</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="removeFromWatchlist()" class="remove-button">
          <mat-icon>remove_circle</mat-icon>
          <span>Remove from Watchlist</span>
        </button>
      </ng-container>
    </mat-menu>
  `,
  styles: [`
    .watchlist-button {
      color: var(--text-secondary-color);
      transition: all 0.3s ease;
      
      &:hover {
        color: var(--primary-color);
        transform: scale(1.1);
      }
      
      &.in-watchlist {
        color: var(--primary-color);
        
        &:hover {
          color: var(--primary-dark-color);
        }
      }
    }
    
    .remove-button {
      color: var(--error-color);
      
      &:hover {
        background-color: var(--error-color);
        color: white;
      }
    }
  `]
})
export class WatchlistButtonComponent implements OnInit {
  @Input() item?: Movie | Person;
  @Input() type?: 'movie' | 'person';
  @Input() disabled = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() watchlistToggled = new EventEmitter<void>();

  isInWatchlist = false;
  watchlistItem?: WatchlistItem;

  constructor(private watchlistService: WatchlistService) {}

  ngOnInit() {
    if (this.item && this.type) {
      this.isInWatchlist = this.watchlistService.isInWatchlist(this.item.id, this.type);
      this.watchlistItem = this.watchlistService.getWatchlistItem(this.item.id, this.type);
    }
  }

  get tooltipText(): string {
    if (this.isInWatchlist) {
      const status = this.watchlistItem?.status;
      switch (status) {
        case 'want_to_watch': return 'In Watchlist - Want to Watch';
        case 'watching': return 'In Watchlist - Currently Watching';
        case 'watched': return 'In Watchlist - Already Watched';
        default: return 'In Watchlist';
      }
    }
    return 'Add to Watchlist';
  }

  get iconName(): string {
    if (this.isInWatchlist) {
      const status = this.watchlistItem?.status;
      switch (status) {
        case 'want_to_watch': return 'bookmark_added';
        case 'watching': return 'play_circle_filled';
        case 'watched': return 'check_circle';
        default: return 'bookmark_added';
      }
    }
    return 'bookmark_add';
  }

  addToWatchlist(status: 'want_to_watch' | 'watching' | 'watched', priority: 'low' | 'medium' | 'high') {
    if (this.item && this.type) {
      this.watchlistService.addToWatchlist(this.item, this.type, status, priority);
      this.isInWatchlist = true;
      this.watchlistItem = this.watchlistService.getWatchlistItem(this.item.id, this.type);
      this.watchlistToggled.emit();
    }
  }

  updateStatus(status: 'want_to_watch' | 'watching' | 'watched') {
    if (this.item && this.type) {
      this.watchlistService.updateWatchlistItem(this.item.id, this.type, { status });
      this.watchlistItem = this.watchlistService.getWatchlistItem(this.item.id, this.type);
      this.watchlistToggled.emit();
    }
  }

  removeFromWatchlist() {
    if (this.item && this.type) {
      this.watchlistService.removeFromWatchlist(this.item.id, this.type);
      this.isInWatchlist = false;
      this.watchlistItem = undefined;
      this.watchlistToggled.emit();
    }
  }
}
