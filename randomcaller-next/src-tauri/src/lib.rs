use tauri_plugin_dialog::DialogExt;

/// 打开文件对话框并读取文件内容
#[tauri::command]
async fn open_file_dialog(app_handle: tauri::AppHandle) -> Result<String, String> {
    let file_path = app_handle.dialog()
        .file()
        .add_filter("文本文件", &["txt"])
        .blocking_pick_file()
        .ok_or("未选择文件".to_string())?;

    // 获取文件路径字符串
    let path = file_path.into_path()
        .map_err(|_| "无法获取文件路径".to_string())?;
    
    std::fs::read_to_string(path)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_file_dialog])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
