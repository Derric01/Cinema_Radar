import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';

export interface AdvancedSearchFilters {
  query: string;
  type: 'movie' | 'person' | 'all';
  genre?: number[];
  releaseYear?: {
    min: number;
    max: number;
  };
  rating?: {
    min: number;
    max: number;
  };
  runtime?: {
    min: number;
    max: number;
  };
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'title';
  sortOrder?: 'asc' | 'desc';
  includeAdult?: boolean;
  language?: string;
  region?: string;
}

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatChipsModule
  ],
  template: `
    <div class="advanced-search-container">
      <mat-accordion>
        <mat-expansion-panel [expanded]="expanded">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>tune</mat-icon>
              Advanced Search Filters
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="filters-content">
            <!-- Search Type -->
            <mat-form-field appearance="outline">
              <mat-label>Search Type</mat-label>
              <mat-select [(value)]="filters.type" (selectionChange)="onFiltersChange()">
                <mat-option value="all">All</mat-option>
                <mat-option value="movie">Movies</mat-option>
                <mat-option value="person">People</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Genre Filter (for movies) -->
            <mat-form-field appearance="outline" *ngIf="filters.type === 'movie' || filters.type === 'all'">
              <mat-label>Genres</mat-label>
              <mat-select [(value)]="filters.genre" multiple (selectionChange)="onFiltersChange()">
                <mat-option *ngFor="let genre of genres" [value]="genre.id">
                  {{ genre.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Release Year Range -->
            <div class="range-filter" *ngIf="filters.type === 'movie' || filters.type === 'all'">
              <label>Release Year</label>
              <div class="range-inputs">
                <mat-form-field appearance="outline">
                  <mat-label>From</mat-label>
                  <input matInput type="number" [(ngModel)]="filters.releaseYear!.min" 
                         (ngModelChange)="onFiltersChange()" min="1900" [max]="currentYear">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>To</mat-label>
                  <input matInput type="number" [(ngModel)]="filters.releaseYear!.max" 
                         (ngModelChange)="onFiltersChange()" min="1900" [max]="currentYear + 5">
                </mat-form-field>
              </div>
            </div>

            <!-- Rating Range -->
            <div class="range-filter" *ngIf="filters.type === 'movie' || filters.type === 'all'">
              <label>Rating (0-10)</label>
              <div class="range-inputs">
                <mat-form-field appearance="outline">
                  <mat-label>Min Rating</mat-label>
                  <input matInput type="number" [(ngModel)]="filters.rating!.min" 
                         (ngModelChange)="onFiltersChange()" min="0" max="10" step="0.1">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Max Rating</mat-label>
                  <input matInput type="number" [(ngModel)]="filters.rating!.max" 
                         (ngModelChange)="onFiltersChange()" min="0" max="10" step="0.1">
                </mat-form-field>
              </div>
            </div>

            <!-- Runtime Range -->
            <div class="range-filter" *ngIf="filters.type === 'movie' || filters.type === 'all'">
              <label>Runtime (minutes)</label>
              <div class="range-inputs">
                <mat-form-field appearance="outline">
                  <mat-label>Min Runtime</mat-label>
                  <input matInput type="number" [(ngModel)]="filters.runtime!.min" 
                         (ngModelChange)="onFiltersChange()" min="0" max="500">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Max Runtime</mat-label>
                  <input matInput type="number" [(ngModel)]="filters.runtime!.max" 
                         (ngModelChange)="onFiltersChange()" min="0" max="500">
                </mat-form-field>
              </div>
            </div>

            <!-- Sort Options -->
            <div class="sort-options">
              <mat-form-field appearance="outline">
                <mat-label>Sort By</mat-label>
                <mat-select [(value)]="filters.sortBy" (selectionChange)="onFiltersChange()">
                  <mat-option value="popularity">Popularity</mat-option>
                  <mat-option value="rating">Rating</mat-option>
                  <mat-option value="release_date">Release Date</mat-option>
                  <mat-option value="title">Title</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Order</mat-label>
                <mat-select [(value)]="filters.sortOrder" (selectionChange)="onFiltersChange()">
                  <mat-option value="desc">Descending</mat-option>
                  <mat-option value="asc">Ascending</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Additional Options -->
            <div class="additional-options">
              <mat-checkbox [(ngModel)]="filters.includeAdult" 
                           (ngModelChange)="onFiltersChange()">
                Include Adult Content
              </mat-checkbox>
            </div>

            <!-- Language Filter -->
            <mat-form-field appearance="outline">
              <mat-label>Language</mat-label>
              <mat-select [(value)]="filters.language" (selectionChange)="onFiltersChange()">
                <mat-option value="">All Languages</mat-option>
                <mat-option *ngFor="let lang of languages" [value]="lang.code">
                  {{ lang.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button mat-raised-button color="primary" (click)="applyFilters()">
                <mat-icon>search</mat-icon>
                Apply Filters
              </button>
              <button mat-stroked-button (click)="resetFilters()">
                <mat-icon>clear</mat-icon>
                Reset
              </button>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styles: [`
    .advanced-search-container {
      margin: 1rem 0;
    }

    .filters-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      padding: 1rem 0;
    }

    .range-filter {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      label {
        font-weight: 500;
        color: var(--text-primary-color);
      }
    }

    .range-inputs {
      display: flex;
      gap: 1rem;
      align-items: center;
      
      mat-form-field {
        flex: 1;
      }
    }

    .sort-options {
      display: flex;
      gap: 1rem;
      grid-column: 1 / -1;
      
      mat-form-field {
        flex: 1;
      }
    }

    .additional-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      grid-column: 1 / -1;
      margin-top: 1rem;
    }

    mat-expansion-panel-header {
      .mat-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    @media (max-width: 768px) {
      .filters-content {
        grid-template-columns: 1fr;
      }
      
      .sort-options {
        flex-direction: column;
      }
      
      .range-inputs {
        flex-direction: column;
      }
    }
  `]
})
export class AdvancedSearchComponent implements OnInit {
  @Input() expanded = false;
  @Input() initialFilters?: Partial<AdvancedSearchFilters>;
  @Output() filtersChanged = new EventEmitter<AdvancedSearchFilters>();
  @Output() filtersApplied = new EventEmitter<AdvancedSearchFilters>();

  filters: AdvancedSearchFilters = {
    query: '',
    type: 'all',
    genre: [],
    releaseYear: { min: 1900, max: new Date().getFullYear() + 5 },
    rating: { min: 0, max: 10 },
    runtime: { min: 0, max: 500 },
    sortBy: 'popularity',
    sortOrder: 'desc',
    includeAdult: false,
    language: '',
    region: ''
  };

  currentYear = new Date().getFullYear();

  genres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
  ];

  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' }
  ];

  ngOnInit() {
    if (this.initialFilters) {
      this.filters = { ...this.filters, ...this.initialFilters };
    }
  }

  onFiltersChange() {
    this.filtersChanged.emit(this.filters);
  }

  applyFilters() {
    this.filtersApplied.emit(this.filters);
  }

  resetFilters() {
    this.filters = {
      query: '',
      type: 'all',
      genre: [],
      releaseYear: { min: 1900, max: this.currentYear + 5 },
      rating: { min: 0, max: 10 },
      runtime: { min: 0, max: 500 },
      sortBy: 'popularity',
      sortOrder: 'desc',
      includeAdult: false,
      language: '',
      region: ''
    };
    this.onFiltersChange();
  }
}
