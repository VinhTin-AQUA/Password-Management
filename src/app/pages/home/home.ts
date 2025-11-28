import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { AUTH_ROUTE, AuthRoutes, MAIN_ROUTE, MainRoutes } from '../../core/enums/routes.enum';
import { TauriCommandSerivce } from '../../shared/services/tauri-command-service';
import { SpreadsheetConfigStore } from '../../shared/stores/spread-sheet-config-store';
import { QuestionCancelDialog } from '../../shared/components/question-cancel-dialog/question-cancel-dialog';
import { AccountModel } from '../../shared/models/account-model';
import { UpdateAccountStore } from '../../shared/stores/update-account.store';
import { Icon } from '../../shared/components/icon/icon';
import { PasscodeStore } from '../../shared/stores/passcode.store';
import { AccountStore } from '../../shared/stores/accounts.store';

@Component({
    selector: 'app-home',
    imports: [RouterLink, ClickOutsideDirective, QuestionCancelDialog, Icon],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    openMenu: number | null = null;
    speedDialOpen = false;
    isShowQuestionDialog: boolean = false;
    idToDelete: string | null = null;

    spreadsheetConfigStore = inject(SpreadsheetConfigStore);
    updateAccountStore = inject(UpdateAccountStore);
    passCode = inject(PasscodeStore);
    accountStore = inject(AccountStore);

    constructor(private router: Router, private tauriCommandSerivce: TauriCommandSerivce) {}

    async ngOnInit() {
        await this.getSavedPasscode();
        await this.getAccounts();
    }

    toggleMenu(i: number, event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.openMenu = this.openMenu === i ? null : i;
    }

    onCopy(acc: AccountModel, event: Event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('Copy', acc);
        navigator.clipboard.writeText(acc.password);
        this.openMenu = null;
    }

    onUpdate(acc: AccountModel) {
        this.updateAccountStore.update(acc);
        this.router.navigateByUrl(`/${MAIN_ROUTE}/${MainRoutes.EditAccount}`);
    }

    async onDelete(acc: AccountModel, event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.openMenu = null;
        this.isShowQuestionDialog = true;
        this.idToDelete = acc.id;
    }

    async onShowQuestionDialogClose(result: boolean) {
        this.isShowQuestionDialog = false;

        if (!result) {
            this.idToDelete = null;
            return;
        }

        if (this.idToDelete) {
            this.tauriCommandSerivce.invokeCommand(TauriCommandSerivce.DELETE_ACCOUNT, {
                id: this.idToDelete,
            });
        }
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

    private async getAccounts() {
        if (this.accountStore.accounts().length > 0) {
            return;
        }

        const r = await this.tauriCommandSerivce.invokeCommand<AccountModel[]>(
            TauriCommandSerivce.GET_ACCOUNTS,
            {
                passcode: this.passCode.passCode(),
            }
        );

        if (r) {
            this.accountStore.setAccounts(r);
        }
    }

    private async getSavedPasscode() {
        if (!this.passCode.passCode()) {
            this.router.navigateByUrl(`/${AUTH_ROUTE}/${AuthRoutes.AddPasscode}`);
        }
    }
}
