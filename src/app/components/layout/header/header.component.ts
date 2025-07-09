import { Component, OnInit } from '@angular/core';
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
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  searchControl = new FormControl('');
  isDarkTheme = false;
  favoritesCount = 0;
  isMobile = false;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });

    // Subscribe to favorites count
    this.favoritesService.favorites$.subscribe(favorites => {
      this.favoritesCount = favorites.length;
    });

    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query && query.trim()) {
        this.navigateToSearch(query.trim());
      }
    });
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

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  navigateToFavorites() {
    // This could navigate to a favorites page or open a dialog
    console.log('Navigate to favorites');
  }
}
