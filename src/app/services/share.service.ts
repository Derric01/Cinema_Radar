import { Injectable } from '@angular/core';
import { Movie } from '../models/movie.model';
import { Person } from '../models/person.model';

export interface ShareData {
  title: string;
  text: string;
  url: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private readonly baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  shareMovie(movie: Movie): Promise<void> {
    const shareData: ShareData = {
      title: `${movie.title} - CinemaRadar`,
      text: `Check out "${movie.title}" on CinemaRadar! ${movie.overview?.substring(0, 100)}...`,
      url: `${this.baseUrl}/movie/${movie.id}`,
      image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined
    };

    return this.share(shareData);
  }

  sharePerson(person: Person): Promise<void> {
    const shareData: ShareData = {
      title: `${person.name} - CinemaRadar`,
      text: `Discover ${person.name}'s filmography on CinemaRadar!`,
      url: `${this.baseUrl}/actor/${person.id}`,
      image: person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : undefined
    };

    return this.share(shareData);
  }

  shareApp(): Promise<void> {
    const shareData: ShareData = {
      title: 'CinemaRadar - Discover Movies & Actors',
      text: 'Explore the world of cinema with CinemaRadar - your ultimate movie discovery platform!',
      url: this.baseUrl
    };

    return this.share(shareData);
  }

  private async share(data: ShareData): Promise<void> {
    if (this.isNativeShareSupported()) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url
        });
      } catch (error) {
        // User cancelled or error occurred, fallback to copy URL
        this.copyToClipboard(data.url);
      }
    } else {
      // Fallback: open share dialog with social media options
      this.openShareDialog(data);
    }
  }

  private isNativeShareSupported(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }

  private copyToClipboard(text: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showNotification('Link copied to clipboard!');
      }).catch(() => {
        this.fallbackCopyToClipboard(text);
      });
    } else {
      this.fallbackCopyToClipboard(text);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        this.showNotification('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
      
      document.body.removeChild(textArea);
    }
  }

  private openShareDialog(data: ShareData): void {
    // This will be handled by the share dialog component
    window.dispatchEvent(new CustomEvent('open-share-dialog', { detail: data }));
  }

  private showNotification(message: string): void {
    // This will be handled by a notification service
    window.dispatchEvent(new CustomEvent('show-notification', { detail: message }));
  }

  // Social media sharing URLs
  getTwitterShareUrl(data: ShareData): string {
    const text = encodeURIComponent(`${data.text} ${data.url}`);
    return `https://twitter.com/intent/tweet?text=${text}`;
  }

  getFacebookShareUrl(data: ShareData): string {
    const url = encodeURIComponent(data.url);
    return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  }

  getLinkedInShareUrl(data: ShareData): string {
    const url = encodeURIComponent(data.url);
    const title = encodeURIComponent(data.title);
    const summary = encodeURIComponent(data.text);
    return `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
  }

  getWhatsAppShareUrl(data: ShareData): string {
    const text = encodeURIComponent(`${data.text} ${data.url}`);
    return `https://wa.me/?text=${text}`;
  }

  getTelegramShareUrl(data: ShareData): string {
    const text = encodeURIComponent(`${data.text} ${data.url}`);
    return `https://t.me/share/url?url=${data.url}&text=${text}`;
  }

  getRedditShareUrl(data: ShareData): string {
    const url = encodeURIComponent(data.url);
    const title = encodeURIComponent(data.title);
    return `https://reddit.com/submit?url=${url}&title=${title}`;
  }

  getPinterestShareUrl(data: ShareData): string {
    const url = encodeURIComponent(data.url);
    const description = encodeURIComponent(data.text);
    const media = data.image ? encodeURIComponent(data.image) : '';
    return `https://pinterest.com/pin/create/button/?url=${url}&description=${description}&media=${media}`;
  }
}
