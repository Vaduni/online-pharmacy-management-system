import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import { User, UserProfile, UserPreferences } from '../../../core/types';

type ExtendedUser = User & {
  name?: string;
  state?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferences?: UserPreferences;
};

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class CustomerProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  profileForm!: FormGroup;
  prefModel: UserPreferences = {
    refillReminders: true,
    healthAlerts: false,
    emailNotifications: true
  };

  ngOnInit() {
    const user = this.auth.currentUser() as (User & { state?: string; street?: string; city?: string; zipCode?: string; emergencyContactName?: string; emergencyContactPhone?: string; preferences?: UserPreferences }) | null;
    if (user) {
      const currentUser = user as User & { state?: string; street?: string; city?: string; zipCode?: string; emergencyContactName?: string; emergencyContactPhone?: string; preferences?: UserPreferences };
   this.profileForm = this.fb.group({
  name: [currentUser.profile?.name || '', [Validators.required]],
  phone: [currentUser.profile?.phone || '', [Validators.required]],
  street: [currentUser.profile?.street || '', [Validators.required]],
  city: [currentUser.profile?.city || '', [Validators.required]],
  state: [currentUser.profile?.state || '', [Validators.required]],
  zipCode: [currentUser.profile?.zipCode || '', [Validators.required]],
  emergencyContactName: [
    currentUser.profile?.emergencyContactName || ''
  ],
  emergencyContactPhone: [
    currentUser.profile?.emergencyContactPhone || ''
  ]
});
      this.prefModel = {
        refillReminders: user.preferences?.refillReminders ?? true,
        healthAlerts: user.preferences?.healthAlerts ?? false,
        emailNotifications: user.preferences?.emailNotifications ?? true
      };
    }
  }

  userEmail(): string {
    return this.auth.currentUser()?.email || '';
  }

  isInvalid(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  saveProfile() {
    if (this.profileForm.valid) {
      const profile: UserProfile = this.profileForm.value;
      this.auth.updateProfile(profile);
    }
  }

  savePreferences(formValue: any) {
    const preferences: UserPreferences = {
      refillReminders: !!formValue.refillReminders,
      healthAlerts: !!formValue.healthAlerts,
      emailNotifications: !!formValue.emailNotifications
    };
    this.auth.updatePreferences(preferences);
  }
}