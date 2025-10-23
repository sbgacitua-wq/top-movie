import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MovieFormComponent } from '../movie-form/movie-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss']
})
export class MovieListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['id','primaryTitle','startYear','averageRating','runtimeMinutes','actions'];
  dataSource = new MatTableDataSource<Movie>([]);
  loading = true;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private svc: MovieService, private dialog: MatDialog, private snack: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
    this.svc.init().subscribe(() => {
      this.svc.getMovies$().subscribe(list => {
        this.dataSource.data = list;
        this.loading = false;
      });
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    if (this.paginator) this.paginator.pageSize = 10;
  }

  applyFilter(event: Event) {
    const v = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: Movie, filter: string) =>
      (data.primaryTitle || '').toLowerCase().includes(filter) ||
      (data.description || '').toLowerCase().includes(filter);
    this.dataSource.filter = v;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  viewDetail(m: Movie) { this.router.navigate(['/movie', m.id]); }

  addNew() {
    const ref = this.dialog.open(MovieFormComponent, { width: '720px', data: { mode: 'create' } });
    ref.afterClosed().subscribe(res => {
      if (res?.created) {
        this.svc.create(res.movie);
        this.snack.open('Película creada (temporal)', '', { duration: 2000 });
      }
    });
  }

  edit(m: Movie) {
    const ref = this.dialog.open(MovieFormComponent, { width: '720px', data: { mode: 'edit', movie: m } });
    ref.afterClosed().subscribe(res => {
      if (res?.updated) {
        this.svc.update(m.id, { primaryTitle: res.primaryTitle, description: res.description });
        this.snack.open('Película actualizada', '', { duration: 2000 });
      }
    });
  }

  delete(m: Movie) {
    if (!confirm(`Eliminar "${m.primaryTitle}"?`)) return;
    this.svc.delete(m.id);
    this.snack.open('Película eliminada (temporal)', '', { duration: 2000 });
  }

  resetToOriginal() {
    if (!confirm('Restaurar datos originales?')) return;
    this.svc.resetToOriginalStored();
    this.snack.open('Datos restaurados', '', { duration: 2000 });
  }
}
