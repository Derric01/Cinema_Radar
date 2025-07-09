import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMap = new Map<string, boolean>();

  get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  isLoadingKey(key: string): boolean {
    return this.loadingMap.has(key);
  }

  setLoading(key: string, loading: boolean): void {
    if (loading) {
      this.loadingMap.set(key, true);
    } else {
      this.loadingMap.delete(key);
    }
    
    this.loadingSubject.next(this.loadingMap.size > 0);
  }

  show(key: string = 'default'): void {
    this.setLoading(key, true);
  }

  hide(key: string = 'default'): void {
    this.setLoading(key, false);
  }

  hideAll(): void {
    this.loadingMap.clear();
    this.loadingSubject.next(false);
  }
}
