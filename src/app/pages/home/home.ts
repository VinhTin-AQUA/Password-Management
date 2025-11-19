import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { MAIN_ROUTE, MainRoutes } from '../../core/routes.enum';
import { DialogService } from '../../shared/services/dialog-service';

@Component({
    selector: 'app-home',
    imports: [RouterLink, ClickOutsideDirective],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    openMenu: number | null = null;
    accounts = [
        { name: 'Facebook', username: 'user.fb@gmail.com' },
        { name: 'Gmail', username: 'me@gmail.com' },
        { name: 'Github', username: 'dev123' },
    ];
    speedDialOpen = false;
    mainRoute = MAIN_ROUTE;
    mainRoutes = MainRoutes;

    constructor(private router: Router, private dialogService: DialogService) {}

    toggleMenu(i: number, event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.openMenu = this.openMenu === i ? null : i;
    }

    onEdit(acc: any) {
        console.log('Edit', acc);
        this.openMenu = null;
        this.router.navigateByUrl(`${MAIN_ROUTE}/${MainRoutes.EditAccount}`);
    }

    onCopy(acc: any) {
        console.log('Copy', acc);
        navigator.clipboard.writeText(acc.username);
        this.openMenu = null;
    }

    onDelete(acc: any) {
        console.log('Delete', acc);
        this.openMenu = null;

        this.dialogService.showQuestionCancelDialog(true, 'xoa', 'xoa', false);
    }

    toggleSpeedDial() {
        this.speedDialOpen = !this.speedDialOpen;
    }

    closeSpeedDial() {
        this.speedDialOpen = false;
    }

    closeContextMenu() {
        this.openMenu = null;
    }
}
