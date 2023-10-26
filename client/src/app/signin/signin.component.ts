import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  signinForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
    ) {
    this.signinForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.signinForm.valid) {
      this.authService.signin(this.signinForm.value).subscribe({
        next: (response) => {
          this.authService.saveToken(response.token); // Save token to localStorage
          this.router.navigate(['/'])
            .then(() => {
              location.reload(); // Reload the page
            });
        },
        error: (error) => {
          if (error.status === 400) {
            this.errorMessage = 'Error: Email or password not found';
          } else {
            console.error('Error during sign in:', error);
          }
        }
      });
    }
  }
  gotoSignup() {
    this.router.navigate(['/signup']);
  }


  
}