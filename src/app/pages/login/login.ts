import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MAIN_ROUTE, MainRoutes } from '../../core/enums/routes.enum';

@Component({
    selector: 'app-login',
    imports: [FormsModule, TranslatePipe],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    password = '';

    constructor(private router: Router) {}

    onLogin() {
        console.log('Login with password:', this.password);

        this.router.navigateByUrl(`${MAIN_ROUTE}/${MainRoutes.Home}`);
    }

    onFingerprint() {
        console.log('Fingerprint login clicked');
    }
}
