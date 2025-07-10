import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { Movie } from '../../../models/movie.model';
import { Person } from '../../../models/person.model';

export interface ShareDialogData {
  type: 'movie' | 'person' | 'app';
  item?: Movie | Person;
  title: string;
  url: string;
  description?: string;
}

@Component({
  selector: 'app-share-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule
  ],
  templateUrl: './share-dialog.component.html',
  styleUrl: './share-dialog.component.scss'
})
export class ShareDialogComponent {
  dialogRef = inject<MatDialogRef<ShareDialogComponent>>(MatDialogRef);
  data = inject<ShareDialogData>(MAT_DIALOG_DATA);

  shareOptions = [
    {
      name: 'Copy Link',
      icon: 'content_copy',
      action: () => this.copyToClipboard(),
      color: 'primary'
    },
    {
      name: 'Twitter',
      icon: 'share',
      action: () => this.shareToTwitter(),
      color: 'primary'
    },
    {
      name: 'Facebook',
      icon: 'share',
      action: () => this.shareToFacebook(),
      color: 'primary'
    },
    {
      name: 'WhatsApp',
      icon: 'share',
      action: () => this.shareToWhatsApp(),
      color: 'primary'
    },
    {
      name: 'Email',
      icon: 'email',
      action: () => this.shareViaEmail(),
      color: 'primary'
    }
  ];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.data.url);
      this.showSuccess('Link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = this.data.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showSuccess('Link copied to clipboard!');
    }
  }

  shareToTwitter(): void {
    const text = encodeURIComponent(`Check out ${this.data.title} on CinemaRadar! ${this.data.description || ''}`);
    const url = encodeURIComponent(this.data.url);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    this.close();
  }

  shareToFacebook(): void {
    const url = encodeURIComponent(this.data.url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    this.close();
  }

  shareToWhatsApp(): void {
    const text = encodeURIComponent(`Check out ${this.data.title} on CinemaRadar! ${this.data.url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    this.close();
  }

  shareViaEmail(): void {
    const subject = encodeURIComponent(`Check out ${this.data.title} on CinemaRadar`);
    const body = encodeURIComponent(`I thought you might be interested in this ${this.data.type}:\n\n${this.data.title}\n${this.data.description || ''}\n\n${this.data.url}\n\nShared via CinemaRadar`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    this.close();
  }

  async shareNative(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.data.title,
          text: this.data.description || `Check out ${this.data.title} on CinemaRadar`,
          url: this.data.url
        });
        this.close();
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
  }

  get supportsNativeShare(): boolean {
    return 'share' in navigator;
  }

  private showSuccess(message: string): void {
    // We'll implement this with the notification service later
    console.log(message);
  }

  close(): void {
    this.dialogRef.close();
  }
}
