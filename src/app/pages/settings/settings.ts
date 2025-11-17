import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-settings',
    imports: [FormsModule],
    templateUrl: './settings.html',
    styleUrl: './settings.scss',
})
export class Settings {
    // Language list
    languages = [
        { label: 'English', value: 'en', flag: '/assets/flags/us.png' },
        { label: 'Vietnamese', value: 'vi', flag: '/assets/flags/vn.png' },
        { label: 'Japanese', value: 'jp', flag: '/assets/flags/jp.png' },
    ];

    // Theme list
    themes = [
        { label: 'Light', value: 'light', color: '#f3f4f6' },
        { label: 'Dark', value: 'dark', color: '#111827' },
        { label: 'Blue', value: 'blue', color: '#3b82f6' },
        { label: 'Purple', value: 'purple', color: '#8b5cf6' },
    ];

    // Selected
    selectedLanguage = this.languages[0];
    selectedTheme = this.themes[0];

    // Toggle states
    openLanguage = false;
    openTheme = false;

    toggleLanguage() {
        this.openLanguage = !this.openLanguage;
        this.openTheme = false;
    }

    toggleTheme() {
        this.openTheme = !this.openTheme;
        this.openLanguage = false;
    }

    selectLanguage(lang: any) {
        this.selectedLanguage = lang;
        this.openLanguage = false;
    }

    selectTheme(theme: any) {
        this.selectedTheme = theme;
        this.openTheme = false;
    }
}
