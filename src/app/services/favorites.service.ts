import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { Person } from '../models/person.model';

export interface FavoriteItem {
  id: number;
  type: 'movie' | 'person';
  data: Movie | Person;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'cinema-radar-favorites';
  private favoritesSubject = new BehaviorSubject<FavoriteItem[]>(this.loadFavorites());

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get favorites$(): Observable<FavoriteItem[]> {
    return this.favoritesSubject.asObservable();
  }

  get favorites(): FavoriteItem[] {
    return this.favoritesSubject.value;
  }

  addToFavorites(item: Movie | Person, type: 'movie' | 'person'): void {
    const favorites = this.favorites;
    const exists = favorites.some(fav => fav.id === item.id && fav.type === type);
    
    if (!exists) {
      const newFavorite: FavoriteItem = {
        id: item.id,
        type,
        data: item,
        addedAt: new Date()
      };
      
      const updatedFavorites = [...favorites, newFavorite];
      this.updateFavorites(updatedFavorites);
    }
  }

  removeFromFavorites(id: number, type: 'movie' | 'person'): void {
    const favorites = this.favorites.filter(fav => !(fav.id === id && fav.type === type));
    this.updateFavorites(favorites);
  }

  isFavorite(id: number, type: 'movie' | 'person'): boolean {
    return this.favorites.some(fav => fav.id === id && fav.type === type);
  }

  toggleFavorite(item: Movie | Person, type: 'movie' | 'person'): void {
    if (this.isFavorite(item.id, type)) {
      this.removeFromFavorites(item.id, type);
    } else {
      this.addToFavorites(item, type);
    }
  }

  // Convenience methods for movies
  isMovieFavorite(movieId: number): boolean {
    return this.isFavorite(movieId, 'movie');
  }

  toggleMovieFavorite(movie: Movie): void {
    this.toggleFavorite(movie, 'movie');
  }

  addMovieToFavorites(movie: Movie): void {
    this.addToFavorites(movie, 'movie');
  }

  removeMovieFromFavorites(movieId: number): void {
    this.removeFromFavorites(movieId, 'movie');
  }

  // Convenience methods for persons
  isPersonFavorite(personId: number): boolean {
    return this.isFavorite(personId, 'person');
  }

  togglePersonFavorite(person: Person): void {
    this.toggleFavorite(person, 'person');
  }

  addPersonToFavorites(person: Person): void {
    this.addToFavorites(person, 'person');
  }

  removePersonFromFavorites(personId: number): void {
    this.removeFromFavorites(personId, 'person');
  }

  getFavoritesByType(type: 'movie' | 'person'): FavoriteItem[] {
    return this.favorites.filter(fav => fav.type === type);
  }

  clearAllFavorites(): void {
    this.updateFavorites([]);
  }

  exportFavorites(): string {
    return JSON.stringify(this.favorites, null, 2);
  }

  importFavorites(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        this.updateFavorites(imported);
        return true;
      }
    } catch (error) {
      console.error('Error importing favorites:', error);
    }
    return false;
  }

  private loadFavorites(): FavoriteItem[] {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem(this.FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error loading favorites:', error);
        return [];
      }
    }
    return [];
  }

  private updateFavorites(favorites: FavoriteItem[]): void {
    this.favoritesSubject.next(favorites);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }
}
