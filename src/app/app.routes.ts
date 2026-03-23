import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth/guards/auth.guard';
import { Overview } from './dashboard/pages/overview/overview';
import { Halls } from './dashboard/pages/halls/halls';
import { Users } from './dashboard/pages/users/users';
import { Groups } from './dashboard/pages/groups/groups';
import { Register } from './auth/register/register';
import { ForgotPassword } from './auth/forgot-password/forgot-password';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'auth/register', component: Register },
    { path: 'auth/forgot-password', component: ForgotPassword },
    { 
        path: 'dashboard', 
        component: Dashboard,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: Overview },
            { path: 'halls', component: Halls },
            { path: 'groups', component: Groups},
            { path: 'users', component: Users },
        ]
     },
];
