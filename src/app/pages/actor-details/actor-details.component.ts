import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { TmdbService } from '../../services/tmdb.service';
import { LoadingService } from '../../services/loading.service';
import { ShareService } from '../../services/share.service';
import { FavoritesService } from '../../services/favorites.service';
import { Person, PersonDetails, PersonMovieCredits } from '../../models/person.model';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-actor-details',
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './actor-details.component.html',
  styleUrl: './actor-details.component.scss'
})
export class ActorDetailsComponent implements OnInit, OnDestroy {
  person: PersonDetails | null = null;
  credits: PersonMovieCredits | null = null;
  knownForMovies: Movie[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public tmdbService: TmdbService,
    public loadingService: LoadingService,
    private shareService: ShareService,
    private favoritesService: FavoritesService
  ) {}

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
      this.loadingService.setLoading('actor-details', false);
    }).catch(error => {
      console.error('Failed to load person details:', error);
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
}
