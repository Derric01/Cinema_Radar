export interface SearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MultiSearchResult {
  id: number;
  media_type: 'movie' | 'person' | 'tv';
  name?: string;
  title?: string;
  overview?: string;
  profile_path?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity: number;
  adult: boolean;
  genre_ids?: number[];
  known_for_department?: string;
  known_for?: any[];
  original_language?: string;
  original_title?: string;
  original_name?: string;
  video?: boolean;
}

export type SearchResultType = 'movie' | 'person' | 'all';
