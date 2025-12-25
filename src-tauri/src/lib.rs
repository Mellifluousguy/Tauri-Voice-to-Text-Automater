use tauri::Emitter;
use tauri::command;
use enigo::{Enigo, Key, Keyboard, Settings, Direction}; // Keep for Windows
use std::{thread, time};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState, Shortcut};
use arboard::Clipboard;
use std::process::Command; // 👇 NEW: To run AppleScript

#[command]
fn paste_text(text: String) {
    println!("RUST: Received text: {}", text); 

    // 1. Write to Clipboard
    let mut clipboard = Clipboard::new().unwrap();
    clipboard.set_text(text).unwrap();

    // Wait for clipboard to update
    thread::sleep(time::Duration::from_millis(100));

    // 2. PASTE COMMAND
    #[cfg(target_os = "macos")]
    {
        println!("RUST: Running AppleScript paste...");
        // 👇 This tells macOS System Events to press Cmd+V natively
        let _ = Command::new("osascript")
            .arg("-e")
            .arg("tell application \"System Events\" to keystroke \"v\" using command down")
            .output();
    }

    #[cfg(not(target_os = "macos"))]
    {
        // Windows/Linux Logic (Enigo works fine here)
        let mut enigo = Enigo::new(&Settings::default()).unwrap();
        let _ = enigo.key(Key::Control, Direction::Press);
        thread::sleep(time::Duration::from_millis(100));
        let _ = enigo.key(Key::Unicode('v'), Direction::Click);
        thread::sleep(time::Duration::from_millis(100));
        let _ = enigo.key(Key::Control, Direction::Release);
    }
    
    println!("RUST: Paste command finished");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
    println!("RUST: Shortcut triggered");
    // 👇 We send "true" or any string so JS has something to grab
    let _ = app.emit("toggle-recording", "true"); 
}
                })
                .build(),
        )
        .setup(|app| {
            #[cfg(desktop)]
            {
                let shortcut_str = "CommandOrControl+Shift+Space";
                app.global_shortcut().register(shortcut_str.parse::<Shortcut>().unwrap())?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![paste_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}