import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      repassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {}

   checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const repassword = group.get('repassword')?.value;
    return password === repassword ? null : { notSame: true };
  }




  onSubmit() {
  if (this.signupForm.valid) {
    this.authService.signup(this.signupForm.value).subscribe(
      () => {
        this.router.navigate(['/signin']);
      },
      (error) => {
        console.error('Error during signup:', error);
      }
    );
  }
}


  goToSignIn() {
    this.router.navigate(['/signin']);
  }
}