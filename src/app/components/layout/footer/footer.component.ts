import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { ShareService } from '../../../services/share.service';

@Component({
  selector: 'app-footer',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  private shareService = inject(ShareService);

  currentYear = new Date().getFullYear();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  shareApp() {
    this.shareService.shareApp();
  }

  openGitHub() {
    window.open('https://github.com', '_blank');
  }

  openTMDB() {
    window.open('https://www.themoviedb.org', '_blank');
  }
}
