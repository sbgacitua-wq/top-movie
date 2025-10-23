import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Movie } from '../models/movie.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private ORIGINAL_KEY = 'movies_original';
  private headers = new HttpHeaders({
    'x-rapidapi-host': environment.rapidApiHost,
    'x-rapidapi-key': environment.rapidApiKey
  });

  private workingMovies: Movie[] = [];
  private movies$ = new BehaviorSubject<Movie[]>([]);
  loading = false;

  constructor(private http: HttpClient) {}

  init(): Observable<Movie[]> {
    this.loading = true;
    try {
      const stored = localStorage.getItem(this.ORIGINAL_KEY);
      if (stored) {
        const original = JSON.parse(stored) as Movie[];
        this.resetWorkingTo(original);
        this.loading = false;
        return of(original);
      }
    } catch { /* ignore */ }

    return this.http.get<Movie[]>(environment.apiUrl, { headers: this.headers }).pipe(
      map(res => Array.isArray(res) ? res : (res as any).data || []),
      tap(list => {
        try { localStorage.setItem(this.ORIGINAL_KEY, JSON.stringify(list)); } catch {}
        this.resetWorkingTo(list);
        this.loading = false;
      }),
      catchError(err => {
        console.error(err);
        this.loading = false;
        return of([]);
      })
    );
  }

  private resetWorkingTo(original: Movie[]) {
    this.workingMovies = original.map(m => ({ ...m }));
    this.movies$.next(this.workingMovies);
  }

  getMovies$(): Observable<Movie[]> {
    return this.movies$.asObservable();
  }

  getById(id: string): Movie | undefined {
    return this.workingMovies.find(m => m.id === id);
  }

  create(partial: Partial<Movie>): Movie {
    const newMovie: Movie = {
      id: 'tmp_' + Math.random().toString(36).slice(2,9),
      primaryTitle: partial.primaryTitle || 'Untitled',
      description: partial.description || '',
      primaryImage: partial.primaryImage || '',
      averageRating: partial.averageRating || 0,
      startYear: partial.startYear || new Date().getFullYear(),
      runtimeMinutes: partial.runtimeMinutes || 0,
      genres: partial.genres || []
    };
    this.workingMovies.unshift(newMovie);
    this.movies$.next(this.workingMovies);
    return newMovie;
  }

  update(id: string, patch: Partial<Movie>): boolean {
    const idx = this.workingMovies.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.workingMovies[idx] = { ...this.workingMovies[idx], ...patch };
    this.movies$.next(this.workingMovies);
    return true;
  }

  delete(id: string): boolean {
    const before = this.workingMovies.length;
    this.workingMovies = this.workingMovies.filter(m => m.id !== id);
    const ok = this.workingMovies.length !== before;
    if (ok) this.movies$.next(this.workingMovies);
    return ok;
  }

  resetToOriginalStored() {
    try {
      const stored = localStorage.getItem(this.ORIGINAL_KEY);
      if (stored) this.resetWorkingTo(JSON.parse(stored));
    } catch {}
  }

  seedUpdateById(id: string, patch: Partial<Movie>): boolean {
    try {
      const storedRaw = localStorage.getItem(this.ORIGINAL_KEY);
      const stored = storedRaw ? JSON.parse(storedRaw) as Movie[] : [];
      const idx = stored.findIndex(m => m.id === id);
      if (idx === -1) return false;
      stored[idx] = { ...stored[idx], ...patch };
      localStorage.setItem(this.ORIGINAL_KEY, JSON.stringify(stored));
      // Sincronizar inmediatamente la copia en memoria si quieres ver cambios sin reload
      this.resetWorkingTo(stored);
      return true;
    } catch (e) {
      console.error('seedUpdateById error', e);
      return false;
    }
  }
}
