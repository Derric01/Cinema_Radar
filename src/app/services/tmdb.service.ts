import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  Movie, 
  MovieDetails, 
  MovieResponse, 
  MovieCredits, 
  MovieVideos 
} from '../models/movie.model';
import { 
  Person, 
  PersonDetails, 
  PersonResponse, 
  PersonMovieCredits 
} from '../models/person.model';
import { SearchResponse, MultiSearchResult } from '../models/search.model';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private cache = new Map<string, any>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly baseUrl = environment.tmdbBaseUrl;
  private readonly apiKey = environment.tmdbApiKey;
  
  constructor(private http: HttpClient) {}

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Movie endpoints
  getTopRatedMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());
    
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/top_rated`, { params });
  }

  getUpcomingMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());
    
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/upcoming`, { params });
  }

  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());
    
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/popular`, { params });
  }

  getNowPlayingMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());
    
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/now_playing`, { params });
  }

  getMovieDetails(movieId: number): Observable<MovieDetails> {
    const params = new HttpParams().set('api_key', this.apiKey);
    
    return this.http.get<MovieDetails>(`${this.baseUrl}/movie/${movieId}`, { params });
  }

  getMovieCredits(movieId: number): Observable<MovieCredits> {
    const params = new HttpParams().set('api_key', this.apiKey);
    
    return this.http.get<MovieCredits>(`${this.baseUrl}/movie/${movieId}/credits`, { params });
  }

  getMovieVideos(movieId: number): Observable<MovieVideos> {
    const params = new HttpParams().set('api_key', this.apiKey);
    
    return this.http.get<MovieVideos>(`${this.baseUrl}/movie/${movieId}/videos`, { params });
  }

  getSimilarMovies(movieId: number, page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());
    
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/${movieId}/similar`, { params });
  }

  getTrendingMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());
    
    const cacheKey = 'trending_movies';
    const cached = this.getCachedData<any>(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    return this.http.get<MovieResponse>(`${this.baseUrl}/trending/movie/week`, { params })
      .pipe(
        tap(data => this.setCachedData(cacheKey, data)),
        catchError(this.handleError<any>('getTrendingMovies', { results: [] }))
      );
  }

  // Person endpoints
  getPopularPeople(page: number = 1): Observable<PersonResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());
    
    return this.http.get<PersonResponse>(`${this.baseUrl}/person/popular`, { params });
  }

  getPersonDetails(personId: number): Observable<PersonDetails> {
    const params = new HttpParams().set('api_key', this.apiKey);
    
    return this.http.get<PersonDetails>(`${this.baseUrl}/person/${personId}`, { params });
  }

  getPersonMovieCredits(personId: number): Observable<PersonMovieCredits> {
    const params = new HttpParams().set('api_key', this.apiKey);
    
    return this.http.get<PersonMovieCredits>(`${this.baseUrl}/person/${personId}/movie_credits`, { params });
  }

  getPopularActors(page: number = 1): Observable<PersonResponse> {
    return this.getPopularPeople(page);
  }

  // Search endpoints
  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('page', page.toString());
    
    return this.http.get<MovieResponse>(`${this.baseUrl}/search/movie`, { params });
  }

  searchPeople(query: string, page: number = 1): Observable<PersonResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('page', page.toString());
    
    return this.http.get<PersonResponse>(`${this.baseUrl}/search/person`, { params });
  }

  multiSearch(query: string, page: number = 1): Observable<SearchResponse<MultiSearchResult>> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('page', page.toString());
    
    return this.http.get<SearchResponse<MultiSearchResult>>(`${this.baseUrl}/search/multi`, { params });
  }

  // Utility methods
  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return '/assets/images/no-image-placeholder.jpg';
    return `${environment.tmdbImageBaseUrl}/${size}${path}`;
  }

  getBackdropUrl(path: string | null, size: string = 'w1280'): string {
    if (!path) return '/assets/images/no-backdrop-placeholder.jpg';
    return `${environment.tmdbImageBaseUrl}/${size}${path}`;
  }

  getYouTubeTrailerUrl(key: string): string {
    return `${environment.youtubeBaseUrl}/${key}`;
  }

  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getGenreNames(genreIds: number[]): string[] {
    const genreMap: { [key: number]: string } = {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western'
    };

    return genreIds.map(id => genreMap[id] || 'Unknown').filter(Boolean);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
