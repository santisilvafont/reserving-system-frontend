import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth/guards/auth.guard';
import { Halls } from './dashboard/pages/halls/halls';
import { Users } from './dashboard/pages/users/users';
import { Groups } from './dashboard/pages/groups/groups';
import { Register } from './auth/register/register';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { Profile } from './dashboard/pages/profile/profile';
import { Reservations } from './dashboard/pages/reservations/reservations';
import { ResetPassword } from './auth/reset-password/reset-password';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { 
        path: 'login', 
        component: Login,
        title: 'Login | Reserving System'
    },
    { 
        path: 'auth/register', 
        component: Register,
        title: 'Register | Reserving System'
    },
    { 
        path: 'auth/forgot-password', 
        component: ForgotPassword,
        title: 'Forgot Password | Reserving System'
    },
    { 
        path: 'auth/reset-password', 
        component: ResetPassword,
        title: 'Reset Password | Reserving System'
    },
    { 
        path: 'dashboard', 
        component: Dashboard,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'reservations', pathMatch: 'full' },
            { 
                path: 'reservations', 
                component: Reservations,
                title: 'Reservations | Reserving System'
            },
            { 
                path: 'halls', 
                component: Halls,
                title: 'Halls | Reserving System'
            },
            { 
                path: 'groups', 
                component: Groups,
                title: 'Groups | Reserving System'
            },
            { 
                path: 'users', 
                component: Users,
                title: 'Users Management | Reserving System'
            },
            { 
                path: 'profile', 
                component: Profile,
                title: 'My Profile | Reserving System'
            }
        ]
     },
];