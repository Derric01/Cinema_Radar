import { Injectable } from '@angular/core';
import { Movie } from '../models/movie.model';
import { Person } from '../models/person.model';

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardGeneratorService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  private templates: CardTemplate[] = [
    {
      id: 'classic',
      name: 'Classic Dark',
      description: 'Professional dark theme with elegant typography',
      preview: '/assets/templates/classic-preview.jpg'
    },
    {
      id: 'modern',
      name: 'Modern Gradient',
      description: 'Contemporary design with vibrant gradients',
      preview: '/assets/templates/modern-preview.jpg'
    }
  ];

  getTemplates(): CardTemplate[] {
    return this.templates;
  }

  async generateMovieCard(
    movie: Movie,
    templateId: string = 'classic'
  ): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.initializeCanvas();
        
        if (!this.canvas || !this.ctx) {
          throw new Error('Canvas not initialized');
        }

        const width = 800;
        const height = 1200;
        this.canvas.width = width;
        this.canvas.height = height;

        await this.drawMovieCard(movie, templateId);
        
        this.canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate card'));
          }
        }, 'image/png');
      } catch (error) {
        console.error('Error generating movie card:', error);
        reject(error);
      }
    });
  }

  async generatePersonCard(
    person: Person,
    templateId: string = 'classic'
  ): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.initializeCanvas();
        
        if (!this.canvas || !this.ctx) {
          throw new Error('Canvas not initialized');
        }

        const width = 800;
        const height = 1200;
        this.canvas.width = width;
        this.canvas.height = height;

        await this.drawPersonCard(person, templateId);
        
        this.canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate card'));
          }
        }, 'image/png');
      } catch (error) {
        console.error('Error generating person card:', error);
        reject(error);
      }
    });
  }

  downloadCard(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private async initializeCanvas(): Promise<void> {
    if (typeof document === 'undefined') {
      throw new Error('Canvas not available in server-side environment');
    }

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      
      if (!this.ctx) {
        throw new Error('Failed to get canvas context');
      }
    }
  }

  private async drawMovieCard(movie: Movie, templateId: string): Promise<void> {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Professional gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < width; i += 60) {
      for (let j = 0; j < height; j += 60) {
        ctx.fillRect(i, j, 1, 1);
      }
    }

    // Draw poster with professional styling
    if (movie.poster_path) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      
      await this.drawImage(
        `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        60, 60, width - 120, 450,
        12
      );
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    // Professional title styling
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    this.wrapText(ctx, movie.title, width / 2, 580, width - 120, 55);

    // Rating with professional badge
    if (movie.vote_average) {
      this.drawProfessionalRating(ctx, movie.vote_average, width / 2, 650);
    }

    // Release year with elegant styling
    if (movie.release_date) {
      ctx.fillStyle = '#a0a0a0';
      ctx.font = '28px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(new Date(movie.release_date).getFullYear().toString(), width / 2, 700);
    }

    // Overview with professional typography
    if (movie.overview) {
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '22px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      this.wrapText(ctx, movie.overview, width / 2, 760, width - 120, 32);
    }

    // Professional footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, height - 80, width, 1);
    
    ctx.fillStyle = '#ff6b35';
    ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CINEMA RADAR', width / 2, height - 40);
  }

  private async drawPersonCard(person: Person, templateId: string): Promise<void> {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Professional gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < width; i += 60) {
      for (let j = 0; j < height; j += 60) {
        ctx.fillRect(i, j, 1, 1);
      }
    }

    // Profile image with professional styling
    if (person.profile_path) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      
      await this.drawImage(
        `https://image.tmdb.org/t/p/w500${person.profile_path}`,
        60, 60, width - 120, 450,
        12
      );
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    // Professional name styling
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    this.wrapText(ctx, person.name, width / 2, 580, width - 120, 55);

    // Department with elegant styling
    if (person.known_for_department) {
      ctx.fillStyle = '#ff6b35';
      ctx.font = '28px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(person.known_for_department.toUpperCase(), width / 2, 630);
    }

    // Known for movies
    if (person.known_for && person.known_for.length > 0) {
      ctx.fillStyle = '#a0a0a0';
      ctx.font = '22px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KNOWN FOR:', width / 2, 680);
      
      const knownForText = person.known_for
        .slice(0, 3)
        .map(movie => movie.title || movie.name)
        .join(' • ');
      
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '20px "Segoe UI", system-ui, sans-serif';
      this.wrapText(ctx, knownForText, width / 2, 720, width - 120, 30);
    }

    // Professional footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, height - 80, width, 1);
    
    ctx.fillStyle = '#ff6b35';
    ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CINEMA RADAR', width / 2, height - 40);
  }

  private drawProfessionalRating(ctx: CanvasRenderingContext2D, rating: number, x: number, y: number): void {
    const radius = 35;
    
    // Background circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fill();
    
    // Rating circle
    ctx.beginPath();
    ctx.arc(x, y, radius - 3, 0, 2 * Math.PI);
    ctx.strokeStyle = rating >= 7 ? '#4CAF50' : rating >= 5 ? '#FF9800' : '#F44336';
    ctx.lineWidth = 6;
    ctx.stroke();
    
    // Rating text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(rating.toFixed(1), x, y + 7);
  }

  private async drawImage(
    src: string,
    x: number,
    y: number,
    width: number,
    height: number,
    borderRadius: number = 0
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        if (!this.ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        if (borderRadius > 0) {
          this.ctx.save();
          this.roundRect(this.ctx, x, y, width, height, borderRadius);
          this.ctx.clip();
        }

        this.ctx.drawImage(img, x, y, width, height);

        if (borderRadius > 0) {
          this.ctx.restore();
        }

        resolve();
      };

      img.onerror = () => {
        if (this.ctx) {
          this.ctx.fillStyle = '#333333';
          this.ctx.fillRect(x, y, width, height);
          
          this.ctx.fillStyle = '#666666';
          this.ctx.font = '24px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('Image not available', x + width / 2, y + height / 2);
        }
        resolve();
      };

      img.src = src;
    });
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  }
}
