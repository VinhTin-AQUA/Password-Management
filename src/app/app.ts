import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './shared/services/language-service';
import { DialogService } from './shared/services/dialog-service';
import { Loader } from './shared/components/loader/loader';
import { SpreadsheetConfigStore } from './shared/stores/spread-sheet-config-store';
import { EConfigFileNames } from './core/enums/file-names';
import { AppFolderHelper } from './shared/helpers/app-folder';
import { EAppFolderNames } from './core/enums/folder-names';
import { FileHelper } from './shared/helpers/file-helper';
import { SpreadsheetConfigModel } from './shared/models/spreadsheet-config';
import { join } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';
import { StoreHelper } from './shared/helpers/store-helper';
import { Toast } from './shared/components/toast/toast';
import { PasscodeStore } from './shared/stores/passcode.store';
import { SettingKeys } from './core/enums/setting-keys';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Loader, Toast],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected readonly title = signal('password-management');
    spreadsheetConfigStore = inject(SpreadsheetConfigStore);
    passcodeStore = inject(PasscodeStore);

    constructor(public dialogService: DialogService, private languageService: LanguageService) {}

    async ngOnInit() {
        await this.checkConfig();
        await this.init();
        await this.getPasscode();
    }

    private async checkConfig(): Promise<boolean> {
        const credentialFolder = await AppFolderHelper.getFolderPath(EAppFolderNames.CredentialDir);
        const configFolder = await AppFolderHelper.getFolderPath(EAppFolderNames.ConfigDir);

        const credentialPath = await join(
            credentialFolder,
            EConfigFileNames.GOOGLE_CREDENTIAL_FILE_NAME
        );
        const configPath = await join(configFolder, EConfigFileNames.CONFIG_PATH);

        const credentialPathExists = await exists(credentialPath);
        const configPathExists = await exists(configPath);

        const spreadsheetConfig = await FileHelper.getObjectFromFile<SpreadsheetConfigModel>(
            configPath
        );
        if (spreadsheetConfig) {
            this.spreadsheetConfigStore.update(spreadsheetConfig);
        }

        return credentialPathExists && configPathExists;
    }

    private async init() {
        await StoreHelper.init();
        // const code = await StoreHelper.getValue<string>(SettingKeys.language);

        // if (!code) {
        //     return;
        // }
        // this.languageService.use(code);
    }

    private async getPasscode() {
        const savedPassCode = await StoreHelper.getValue<string>(SettingKeys.passCode);
        this.passcodeStore.updatePasscode(savedPassCode ?? '');
    }
}
