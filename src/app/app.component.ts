import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { ThemeService } from './services/theme.service';
import { LoadingService } from './services/loading.service';
import { NotificationService } from './services/notification.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'CinemaRadar';
  isLoading$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.isLoading$ = this.loadingService.isLoading$;
  }

  ngOnInit() {
    // Initialize theme
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    
    // Listen for global notification events
    if (typeof window !== 'undefined') {
      window.addEventListener('show-notification', (event: any) => {
        this.notificationService.info(event.detail);
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
