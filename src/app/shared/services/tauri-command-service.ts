import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { DialogService } from './dialog-service';

@Injectable({
    providedIn: 'root',
})
export class TauriCommandSerivce {
    static readonly INIT_GOOGLE_SHEET_COMMAND = 'init_google_sheet_command';
    static readonly ADD_ACCOUNT = 'add_account';

    constructor(private dialogService: DialogService) {}

    async invokeCommand<T>(
        cmd: string,
        spreadSheet: {
            sheetName: string;
            spreadsheetId: string;
        },
        params: any
    ): Promise<T | null> {
        this.dialogService.showLoadingDialog(true);
        try {
            const initOk = await invoke<T>(cmd, {
                sheetName: spreadSheet.sheetName,
                spreadsheetId: spreadSheet.spreadsheetId,
                ...params,
            });
            this.dialogService.showLoadingDialog(false);
            return initOk;
        } catch (e) {
            alert(e);
            console.log('e: ', e);
            this.dialogService.showLoadingDialog(false);
            return null;
        }
    }
}
