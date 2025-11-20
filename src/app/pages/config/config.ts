import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AUTH_ROUTE, AuthRoutes, MAIN_ROUTE } from '../../core/routes.enum';

@Component({
    selector: 'app-config',
    imports: [FormsModule, TranslatePipe],
    templateUrl: './config.html',
    styleUrl: './config.scss',
})
export class Config {
    serverUrl = '';
    apiKey = '';
    timeout: number | null = null;

    constructor(private router: Router) {}

    onSave() {
        console.log('Saved config:', {
            serverUrl: this.serverUrl,
            apiKey: this.apiKey,
            timeout: this.timeout,
        });

        this.router.navigateByUrl(`/${AUTH_ROUTE}/${AuthRoutes.Login}`);
    }
}
