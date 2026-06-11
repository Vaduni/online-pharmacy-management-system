import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'customer',
    loadComponent: () => import('./features/customer/customer-layout/customer-layout.component').then(m => m.CustomerLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/customer/dashboard/dashboard.component').then(m => m.CustomerDashboardComponent)
      },
      {
        path: 'catalog',
        loadComponent: () => import('./features/customer/catalog/catalog.component').then(m => m.CustomerCatalogComponent)
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./features/customer/product-detail/product-detail.component').then(m => m.CustomerProductDetailComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/customer/cart/cart.component').then(m => m.CustomerCartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/customer/checkout/checkout.component').then(m => m.CustomerCheckoutComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/customer/profile/profile.component').then(m => m.CustomerProfileComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/customer/orders/orders.component').then(m => m.CustomerOrdersComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
    {
  path: 'categories',
  loadComponent: () =>
  import('./features/admin/categories/admin-categories/admin-categories')
        .then(m => (m as any).AdminCategoriesComponent || (m as any).AdminCategories || (m as any).default)
},

{
  path: 'orders',
  loadComponent: () =>
    import('./features/admin/orders/admin-orders/admin-orders')
      .then(m => m.AdminOrders)
},

{
  path: 'support',
  loadComponent: () =>
    import('./features/admin/support/admin-support/admin-support')
      .then(m => m.AdminSupport)
},
      {
        path: 'medicines',
        loadComponent: () => import('./features/admin/medicines/admin-medicines.component').then(m => m.AdminMedicinesComponent)
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./features/admin/prescriptions/admin-prescriptions.component').then(m => m.AdminPrescriptionsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];