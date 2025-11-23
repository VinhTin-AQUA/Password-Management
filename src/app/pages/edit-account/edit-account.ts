import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SpreadsheetConfigStore } from '../../shared/stores/spread-sheet-config-store';
import { TauriCommandSerivce } from '../../shared/services/tauri-command-service';
import { ActivatedRoute, Router } from '@angular/router';
import { AUTH_ROUTE, AuthRoutes } from '../../core/enums/routes.enum';
import { SettingKeys } from '../../core/enums/setting-keys';
import { StoreHelper } from '../../shared/helpers/store-helper';
import { ResponseCommand } from '../../shared/models/response-command';
import { AccountModel } from '../../shared/models/account-model';
import { UpdateAccountStore } from '../../shared/stores/update-account.store';

@Component({
    selector: 'app-edit-account',
    imports: [TranslatePipe, ReactiveFormsModule],
    templateUrl: './edit-account.html',
    styleUrl: './edit-account.scss',
})
export class EditAccount {
    showPassword = false;
    submitted: boolean = false;
    form!: FormGroup;
    savedPassCode: string | undefined = undefined;

    spreadsheetConfigStore = inject(SpreadsheetConfigStore);
    updateAccountStore = inject(UpdateAccountStore);

    constructor(
        private tauriCommandSerivce: TauriCommandSerivce,
        private fb: FormBuilder,
        private router: Router
    ) {}

    async ngOnInit() {
        this.form = this.fb.group({
            id: [''],
            accountName: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
            note: [''],
        });
        await this.init();
    }

    async save() {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }

        if (this.form.controls['password'].value !== this.form.controls['confirmPassword'].value) {
            return;
        }

        // TODO: Gửi dữ liệu lên backend hoặc emit event
        const updateAccount: AccountModel = {
            id: this.form.controls['id'].value,
            account_name: this.form.controls['accountName'].value,
            note: this.form.controls['note'].value,
            password: this.form.controls['password'].value,
            user_name: this.form.controls['username'].value,
            salt_base64: '',
        };

        const response = await this.tauriCommandSerivce.invokeCommand<ResponseCommand>(
            TauriCommandSerivce.UPDATE_ACCOUNT,
            {
                passcode: this.savedPassCode,
                password: updateAccount,
            }
        );
    }

    private async init() {
        this.savedPassCode = await StoreHelper.getValue<string>(SettingKeys.passCode);
        if (!this.savedPassCode) {
            this.router.navigateByUrl(`/${AUTH_ROUTE}/${AuthRoutes.AddPasscode}`);
        }

        this.form.controls['id'].setValue(this.updateAccountStore.id());
        this.form.controls['accountName'].setValue(this.updateAccountStore.account_name());
        this.form.controls['username'].setValue(this.updateAccountStore.user_name());
        this.form.controls['password'].setValue(this.updateAccountStore.password());
        this.form.controls['confirmPassword'].setValue(this.updateAccountStore.password());
        this.form.controls['note'].setValue(this.updateAccountStore.note());
    }
}
