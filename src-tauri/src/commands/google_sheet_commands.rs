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
