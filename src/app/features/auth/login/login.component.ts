import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['customer', Validators.required],
  });

  onSubmit(): void {

  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  const { email, password, role } = this.loginForm.value;

  this.authService
    .login(email, password, role)
    .subscribe({

      next: (users) => {

        if (users.length > 0) {

          const user = users[0];

          this.authService.setCurrentUser(user);

          if (role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/customer/dashboard']);
          }

        } else {

          alert('Invalid email, password or role');

        }
      },

      error: (err) => {
        console.error(err);
        alert('Unable to connect to JSON Server');
      }
    });
  }

  fillDemo(email: string, password: string, role: 'customer' | 'admin'): void {
    this.loginForm.patchValue({
      email,
      password,
      role,
    });

    this.onSubmit();
  }
}