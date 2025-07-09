import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  imports: [CommonModule],
  templateUrl: './loading-skeleton.component.html',
  styleUrl: './loading-skeleton.component.scss'
})
export class LoadingSkeletonComponent {
  @Input() type: 'card' | 'list' | 'text' | 'avatar' | 'hero' = 'card';
  @Input() count = 1;
  @Input() width = '100%';
  @Input() height = 'auto';

  get skeletonArray(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
