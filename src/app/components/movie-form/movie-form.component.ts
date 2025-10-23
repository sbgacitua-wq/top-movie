import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-movie-form',
  templateUrl: './movie-form.component.html',
  styleUrls: ['./movie-form.component.scss']
})
export class MovieFormComponent {
  form: FormGroup;
  mode: 'create' | 'edit' = 'create';

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<MovieFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({
      primaryTitle: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startYear: [new Date().getFullYear(), [Validators.required, Validators.min(1888)]],
      runtimeMinutes: [90, [Validators.required, Validators.min(1)]],
      primaryImage: [''],
      averageRating: [0, [Validators.min(0), Validators.max(10)]]
    });

    if (data?.mode === 'edit' && data.movie) {
      this.mode = 'edit';
      this.form.patchValue({
        primaryTitle: data.movie.primaryTitle,
        description: data.movie.description,
        startYear: data.movie.startYear,
        runtimeMinutes: data.movie.runtimeMinutes,
        primaryImage: data.movie.primaryImage,
        averageRating: data.movie.averageRating
      });
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    if (this.mode === 'edit') {
      this.dialogRef.close({ updated: true, primaryTitle: v.primaryTitle, description: v.description, startYear: v.startYear });
    } else {
      this.dialogRef.close({ created: true, movie: v });
    }
  }

  cancel() { this.dialogRef.close(); }
}
