import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TauriCommandSerivce } from '../../shared/services/tauri-command-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResponseCommand } from '../../shared/models/response-command';
import { SpreadsheetConfigStore } from '../../shared/stores/spread-sheet-config-store';
import { StoreHelper } from '../../shared/helpers/store-helper';
import { SettingKeys } from '../../core/enums/setting-keys';
import { Router } from '@angular/router';
import { AUTH_ROUTE, AuthRoutes } from '../../core/enums/routes.enum';
import { AccountModel } from '../../shared/models/account-model';

@Component({
    selector: 'app-add-account',
    imports: [TranslatePipe, ReactiveFormsModule],
    templateUrl: './add-account.html',
    styleUrl: './add-account.scss',
})
export class AddAccount {
    showPassword = false;
    submitted: boolean = false;
    form!: FormGroup;
    spreadsheetConfigStore = inject(SpreadsheetConfigStore);
    savedPassCode: string | undefined = undefined;

    constructor(
        private tauriCommandSerivce: TauriCommandSerivce,
        private fb: FormBuilder,
        private router: Router
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            accountName: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
            note: [''],
        });
        this.init();
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
        const addAccount: AccountModel = {
            id: crypto.randomUUID(),
            account_name: this.form.controls['accountName'].value,
            note: this.form.controls['note'].value,
            password: this.form.controls['password'].value,
            user_name: this.form.controls['username'].value,
            salt_base64: '',
        };

        const response = await this.tauriCommandSerivce.invokeCommand<ResponseCommand>(
            TauriCommandSerivce.ADD_ACCOUNT,
            {
                passcode: this.savedPassCode,
                password: addAccount,
            }
        );
    }

    private async init() {
        this.savedPassCode = await StoreHelper.getValue<string>(SettingKeys.passCode);
        if (!this.savedPassCode) {
            this.router.navigateByUrl(`/${AUTH_ROUTE}/${AuthRoutes.AddPasscode}`);
        }
    }
}
