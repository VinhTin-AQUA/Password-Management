import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TauriCommandSerivce } from '../../shared/services/tauri-command-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResponseCommand } from '../../shared/models/response-command';
import { SpreadsheetConfigStore } from '../../shared/stores/spread-sheet-config-store';
import { Router } from '@angular/router';
import { AUTH_ROUTE, AuthRoutes } from '../../core/enums/routes.enum';
import { AccountModel } from '../../shared/models/account-model';
import { DialogService } from '../../shared/services/dialog-service';
import { Icon } from '../../shared/components/icon/icon';
import { PasscodeStore } from '../../shared/stores/passcode.store';

@Component({
    selector: 'app-add-account',
    imports: [TranslatePipe, ReactiveFormsModule, Icon],
    templateUrl: './add-account.html',
    styleUrl: './add-account.scss',
})
export class AddAccount {
    showPassword = false;
    submitted: boolean = false;
    form!: FormGroup;
    spreadsheetConfigStore = inject(SpreadsheetConfigStore);
    passCode = inject(PasscodeStore);

    constructor(
        private tauriCommandSerivce: TauriCommandSerivce,
        private fb: FormBuilder,
        private router: Router,
        private dialogService: DialogService
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
                passcode: this.passCode.passCode(),
                password: addAccount,
            }
        );

        if (response?.is_success) {
            this.dialogService.showToastMessage(true, 'Success', 'Add account successfully', true);
        } else {
            this.dialogService.showToastMessage(true, 'Failed', 'Something error', false);
        }
    }

    private async init() {
        if (!this.passCode.passCode()) {
            this.router.navigateByUrl(`/${AUTH_ROUTE}/${AuthRoutes.AddPasscode}`);
        }
    }
}
