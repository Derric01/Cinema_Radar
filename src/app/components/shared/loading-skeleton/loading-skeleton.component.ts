import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  imports: [CommonModule],
  templateUrl: './loading-skeleton.component.html',
  styleUrl: './loading-skeleton.component.scss'
})
export class LoadingSkeletonComponent {
  @Input() type: 'card' | 'list' | 'text' | 'avatar' | 'hero' | 'search' | 'details' = 'card';
  @Input() count = 1;
  @Input() width = '100%';
  @Input() height = 'auto';
  @Input() animated = true;
  @Input() theme: 'light' | 'dark' | 'auto' = 'auto';

  get skeletonArray(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }

  get containerClasses(): string {
    const classes = ['skeleton-container'];
    
    if (this.animated) {
      classes.push('skeleton-animated');
    }
    
    if (this.theme !== 'auto') {
      classes.push(`skeleton-${this.theme}`);
    }
    
    return classes.join(' ');
  }

  trackByIndex(index: number): number {
    return index;
  }
}
