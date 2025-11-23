import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TauriCommandSerivce } from '../../shared/services/tauri-command-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddAccountModel } from './models/add-account.model';
import { ResponseCommand } from '../../shared/models/response-command';
import { SpreadsheetConfigStore } from '../../shared/stores/spread-sheet-config-store';

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

    constructor(private tauriCommandSerivce: TauriCommandSerivce, private fb: FormBuilder) {}

    ngOnInit() {
        this.form = this.fb.group({
            accountName: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
            note: [''],
        });
    }

    async save() {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }

        // TODO: Gửi dữ liệu lên backend hoặc emit event
        const addAccount: AddAccountModel = {
            id: crypto.randomUUID(),
            account_name: this.form.controls['accountName'].value,
            note: this.form.controls['note'].value,
            password: this.form.controls['password'].value,
            user_name: this.form.controls['username'].value,
        };

        const response = await this.tauriCommandSerivce.invokeCommand<ResponseCommand>(
            TauriCommandSerivce.ADD_ACCOUNT,
            {
                sheetName: this.spreadsheetConfigStore.workingSheet().title,
                spreadsheetId: this.spreadsheetConfigStore.spreadSheetId(),
            },
            {
                password: addAccount
            }
        );

        console.log(response);
    }
}
