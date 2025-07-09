import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { MovieDetailsComponent } from './pages/movie-details/movie-details.component';
import { ActorDetailsComponent } from './pages/actor-details/actor-details.component';
import { WatchlistComponent } from './pages/watchlist/watchlist.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'movie/:id', component: MovieDetailsComponent },
  { path: 'actor/:id', component: ActorDetailsComponent },
  { path: 'watchlist', component: WatchlistComponent },
  { path: '**', redirectTo: '' }
];
