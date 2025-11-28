import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { StoreHelper } from '../../shared/helpers/store-helper';
import { SettingKeys } from '../../core/enums/setting-keys';
import { MAIN_ROUTE, MainRoutes } from '../../core/enums/routes.enum';
import { SpreadsheetConfigStore } from '../../shared/stores/spread-sheet-config-store';
import { Icon } from '../../shared/components/icon/icon';
import { PasscodeStore } from '../../shared/stores/passcode.store';

@Component({
    selector: 'app-add-passcode',
    imports: [ReactiveFormsModule, TranslatePipe, Icon],
    templateUrl: './add-passcode.html',
    styleUrl: './add-passcode.scss',
})
export class AddPasscode {
    showPasscode = false;
    submitted: boolean = false;
    form!: FormGroup;
    spreadsheetConfigStore = inject(SpreadsheetConfigStore);
    passcodeStore = inject(PasscodeStore);

    constructor(private fb: FormBuilder, private router: Router) {}

    ngOnInit() {
        this.form = this.fb.group({
            passcode: ['', Validators.required],
            confirmPasscode: ['', Validators.required],
        });
    }

    async save() {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }

        if (this.form.controls['passcode'].value !== this.form.controls['confirmPasscode'].value) {
            return;
        }

        await StoreHelper.setValue(SettingKeys.passCode, this.form.controls['passcode'].value);
        this.passcodeStore.updatePasscode(this.form.controls['passcode'].value);
        this.router.navigateByUrl(`/${MAIN_ROUTE}/${MainRoutes.Home}`);
    }
}
