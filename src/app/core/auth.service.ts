import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { User, UserProfile, UserPreferences } from './types';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  readonly currentUser = signal<User | null>(null);

  readonly isAuthenticated = computed(
    () => this.currentUser() !== null
  );

  readonly isAdmin = computed(
    () => this.currentUser()?.role === 'admin'
  );

  readonly isCustomer = computed(
    () => this.currentUser()?.role === 'customer'
  );

  private readonly STORAGE_KEY_USER = 'pharmacy_current_user';

  constructor(
    private router: Router,
    private notifications: NotificationService
  ) {
    this.loadSession();
  }

  private loadSession(): void {
    const savedUser = localStorage.getItem(
      this.STORAGE_KEY_USER
    );

    if (savedUser) {
      try {
        this.currentUser.set(
          JSON.parse(savedUser)
        );
      } catch {
        localStorage.removeItem(
          this.STORAGE_KEY_USER
        );
      }
    }
  }

  login(
    email: string,
    password: string,
    role: 'customer' | 'admin'
  ) {
    return this.http.get<User[]>(
      `http://localhost:3000/users?email=${email}&password=${password}&role=${role}`
    );
  }

  register(
    email: string,
    password: string,
    role: 'customer' | 'admin',
    profile: UserProfile
  ) {
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      role,
      profile,
      preferences: {
        refillReminders: true,
        healthAlerts: true,
        emailNotifications: true
      }
    };

    return this.http.post<User>(
      'http://localhost:3000/users',
      newUser
    );
  }

  setCurrentUser(user: User): void {
    this.currentUser.set(user);

    localStorage.setItem(
      this.STORAGE_KEY_USER,
      JSON.stringify(user)
    );

    this.notifications.addNotification(
      'Login Successful',
      `Welcome ${user.email}`,
      'success'
    );
  }

  updateProfile(profile: UserProfile): void {

    const user = this.currentUser();

    if (!user) return;

    const updatedUser = {
      ...user,
      profile
    };

    this.currentUser.set(updatedUser);

    localStorage.setItem(
      this.STORAGE_KEY_USER,
      JSON.stringify(updatedUser)
    );
  }

  updatePreferences(
    preferences: UserPreferences
  ): void {

    const user = this.currentUser();

    if (!user) return;

    const updatedUser = {
      ...user,
      preferences
    };

    this.currentUser.set(updatedUser);

    localStorage.setItem(
      this.STORAGE_KEY_USER,
      JSON.stringify(updatedUser)
    );
  }

  logout(): void {

    this.currentUser.set(null);

    localStorage.removeItem(
      this.STORAGE_KEY_USER
    );

    this.notifications.addNotification(
      'Logged Out',
      'You have been logged out',
      'info'
    );

    this.router.navigate(['/login']);
  }
}