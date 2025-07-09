import { Component } from '@angular/core';
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
  currentYear = new Date().getFullYear();

  constructor(private shareService: ShareService) {}

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
