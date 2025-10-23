import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit {
  movie?: Movie;

  constructor(private route: ActivatedRoute, private svc: MovieService, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.movie = this.svc.getById(id);
    if (!this.movie) {
      this.svc.resetToOriginalStored();
      this.movie = this.svc.getById(id);
    }
  }

  back() { this.router.navigate(['/']); }
}
