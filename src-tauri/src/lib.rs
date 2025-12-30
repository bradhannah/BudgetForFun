// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
use tauri::Emitter;

// Sidecar Setup (Phase 3 Implementation):
// 1. Bun binary downloaded to src-tauri/binaries/bun-sidecar-aarch64-apple-darwin
// 2. externalBin configured in src-tauri/tauri.conf.json
// 3. Shell permissions added in src-tauri/capabilities/default.json
// 4. Sidecar spawns Bun process and emits events to frontend
// 5. Test with: invoke('start_bun_sidecar') in Tauri window

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn start_bun_sidecar(app: tauri::AppHandle) -> Result<String, String> {
    let sidecar_command = app
        .shell()
        .sidecar("bun-sidecar")
        .map_err(|e| format!("Failed to create sidecar command: {}", e))?;

    let (mut rx, mut _child) = sidecar_command
        .spawn()
        .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

    let app_clone = app.clone();

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    let _ = app_clone.emit("bun-sidecar-output", Some(format!("{}", line)));
                }
                CommandEvent::Stderr(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    let _ = app_clone.emit("bun-sidecar-error", Some(format!("{}", line)));
                }
                CommandEvent::Terminated(payload) => {
                    let _ = app_clone.emit("bun-sidecar-exited", Some(format!("Exit code: {:?}", payload.code)));
                }
                _ => {}
            }
        }
    });

    Ok("Bun sidecar started successfully".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, start_bun_sidecar])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
