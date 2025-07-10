import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';
import { FavoritesService } from '../../../services/favorites.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    MatRippleModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private favoritesService = inject(FavoritesService);

  searchControl = new FormControl('');
  isDarkTheme = false;
  favoritesCount = 0;
  isMobile = false;
  isSearchFocused = false;
  
  private destroy$ = new Subject<void>();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.currentTheme$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });

    // Subscribe to favorites count
    this.favoritesService.favorites$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(favorites => {
      this.favoritesCount = favorites.length;
    });

    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query && query.trim()) {
        this.navigateToSearch(query.trim());
      }
    });

    // Check if mobile
    this.checkIsMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkIsMobile());
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkIsMobile() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 768;
    }
  }

  navigateToSearch(query: string) {
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  onSearchSubmit() {
    const query = this.searchControl.value;
    if (query && query.trim()) {
      this.navigateToSearch(query.trim());
    }
  }

  onSearchFocus() {
    this.isSearchFocused = true;
  }

  onSearchBlur() {
    this.isSearchFocused = false;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  navigateToFavorites() {
    this.router.navigate(['/favorites']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
