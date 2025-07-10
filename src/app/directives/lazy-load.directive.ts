import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  private el = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  @Input() appLazyLoad = '';
  @Input() placeholder = '/assets/images/placeholder.jpg';
  @Input() errorImage = '/assets/images/error-image.jpg';
  
  private observer?: IntersectionObserver;
  private isLoaded = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setPlaceholder();
      this.createObserver();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setPlaceholder() {
    if (this.placeholder) {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholder);
    }
    this.renderer.addClass(this.el.nativeElement, 'lazy-loading');
  }

  private createObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoaded) {
          this.loadImage();
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private loadImage() {
    const img = new Image();
    
    img.onload = () => {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.appLazyLoad);
      this.renderer.removeClass(this.el.nativeElement, 'lazy-loading');
      this.renderer.addClass(this.el.nativeElement, 'lazy-loaded');
      this.isLoaded = true;
      
      if (this.observer) {
        this.observer.unobserve(this.el.nativeElement);
      }
    };

    img.onerror = () => {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.errorImage);
      this.renderer.removeClass(this.el.nativeElement, 'lazy-loading');
      this.renderer.addClass(this.el.nativeElement, 'lazy-error');
      this.isLoaded = true;
      
      if (this.observer) {
        this.observer.unobserve(this.el.nativeElement);
      }
    };

    img.src = this.appLazyLoad;
  }
}
