use crate::models::{Password, ResponseCommand};
use crate::services::TokenResponse;
use crate::states::AppState;
use tauri::{command, State};
use tokio::sync::Mutex;

#[command]
pub async fn init_google_sheet_command(
    state: State<'_, Mutex<AppState>>,
    json_path: String,
) -> Result<Option<TokenResponse>, String> {
    let mut state_guard = state.lock().await;
    let google_service = &mut state_guard.google_sheet_service;
    let t: Result<Option<TokenResponse>, String> = google_service
        .lock()
        .await
        .init_google_service(&json_path)
        .await
        .map_err(|e| e.to_string());
    t
}

#[command]
pub async fn add_account(
    state: State<'_, Mutex<AppState>>,
    sheet_name: String,
    spreadsheet_id: String,
    password: Password,
) -> Result<Option<ResponseCommand>, String> {
    let mut state_guard = state.lock().await;
    let google_service = &mut state_guard.google_sheet_service;

    let t: Result<Option<ResponseCommand>, String> = google_service
        .lock()
        .await
        .add_account(sheet_name, spreadsheet_id, password)
        .await
        .map_err(|e| e.to_string());
    t
}
