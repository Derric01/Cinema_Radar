import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { ThemeService } from './services/theme.service';
import { LoadingService } from './services/loading.service';
import { NotificationService } from './services/notification.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'CinemaRadar';

  constructor(
    private themeService: ThemeService,
    public loadingService: LoadingService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialize theme
    this.themeService.currentTheme$.subscribe();
    
    // Listen for global notification events
    if (typeof window !== 'undefined') {
      window.addEventListener('show-notification', (event: any) => {
        this.notificationService.info(event.detail);
      });
    }
  }

  ngAfterViewInit() {
    // Fix change detection issue by using markForCheck
    this.cdr.markForCheck();
  }
}
