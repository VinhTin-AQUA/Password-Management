use crate::models::{Password, ResponseCommand};
use anyhow::anyhow;
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, to_value, Value};
use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct GoogleSheetsService {
    pub client: Client,
    pub access_token: String,
}

#[derive(Deserialize, Debug)]
struct ServiceAccount {
    client_email: String,
    private_key: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TokenResponse {
    access_token: String,
    expires_in: i64,
    token_type: String,
}

#[derive(Serialize)]
struct Claims<'a> {
    iss: &'a str,
    scope: &'a str,
    aud: &'a str,
    exp: usize,
    iat: usize,
}

impl GoogleSheetsService {
    const BASE_API: &'static str = "https://sheets.googleapis.com/v4/spreadsheets";
    const SCOPE: &'static str = "https://www.googleapis.com/auth/spreadsheets";
    const AUD_URL: &'static str = "https://oauth2.googleapis.com/token";

    pub fn new() -> Self {
        Self {
            client: Client::new(),
            access_token: String::new(),
        }
    }

    pub async fn init_google_service(
        &mut self,
        json_path: &str,
    ) -> anyhow::Result<Option<TokenResponse>> {
        let jwt = Self::get_jwt(json_path)?;
        let token = Self::get_token_response(&jwt).await?;
        let token = if let Some(token_value) = token {
            self.access_token = token_value.access_token.clone();
            Some(token_value)
        } else {
            return Err(anyhow!("Vui lòng đợi và thử lại trong vài giây"));
        };

        Ok(token)
    }

    pub async fn add_account(
        &mut self,
        sheet_name: String,
        spreadsheet_id: String,
        password: Password,
    ) -> anyhow::Result<Option<ResponseCommand>> {
        println!("password: {:#?}", password);

        let write_range = format!("{}!A:E", urlencoding::encode(sheet_name.as_str()));
        let write_url = format!(
            "{}/{}/values/{}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS",
            Self::BASE_API,
            spreadsheet_id,
            write_range
        );

        let row: Vec<Vec<Value>> = vec![vec![
            Value::from(password.id),
            Value::from(password.account_name),
            Value::from(password.user_name),
            Value::from(password.password),
            Value::from(password.note),
        ]];

        println!("row: {:#?}", row);

        let body = json!({
        "majorDimension": "ROWS",
            "values": row
        });

        _ = self
            .client
            .post(&write_url)
            .bearer_auth(self.access_token.as_str())
            .json(&body)
            .send()
            .await?
            .json::<Value>()
            .await?;

        let response_command: ResponseCommand = ResponseCommand {
            message: "Ghi dữ liệu thành công!".to_string(),
            title: "Success".to_string(),
            is_success: true,
        };
        Ok(Some(response_command))
    }

    /* private methods */

    fn get_jwt(json_path: &str) -> anyhow::Result<String> {
        let data = fs::read_to_string(json_path)?; // file json được tải ở bước trước trong google console
        let json: ServiceAccount = serde_json::from_str(&data)?;
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
        let exp = now + 3600; // 1h

        let claims = Claims {
            iss: &json.client_email,
            scope: Self::SCOPE,
            aud: Self::AUD_URL,
            exp: exp as usize,
            iat: now as usize,
        };

        let key = EncodingKey::from_rsa_pem(json.private_key.as_bytes())?;
        let jwt = encode(&Header::new(Algorithm::RS256), &claims, &key)?;
        Ok(jwt)
    }

    async fn get_token_response(jwt: &str) -> anyhow::Result<Option<TokenResponse>> {
        let client = Client::new();
        let params = [
            ("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"),
            ("assertion", jwt),
        ];

        let res = client.post(Self::AUD_URL).form(&params).send().await?;

        if !res.status().is_success() {
            let status = res.status();
            let text = res
                .text()
                .await
                .unwrap_or_else(|_| "<cannot read body>".to_string());

            eprintln!("Error status: {}", status);
            eprintln!("Error body: {}", text);

            return Ok(None);
        }

        let token: TokenResponse = res.json().await?;
        Ok(Some(token))
    }
}
