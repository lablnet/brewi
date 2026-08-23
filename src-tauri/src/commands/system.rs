use crate::brew::detector::get_environment_info;
use crate::brew::models::BrewEnvInfo;

#[tauri::command]
pub fn get_brew_environment() -> BrewEnvInfo {
    get_environment_info()
}

#[cfg(target_os = "macos")]
mod macos_dock {
    use std::ffi::CString;
    use std::os::raw::c_char;

    #[link(name = "objc", kind = "dylib")]
    extern "C" {
        fn objc_getClass(name: *const c_char) -> *mut std::ffi::c_void;
        fn sel_registerName(name: *const c_char) -> *mut std::ffi::c_void;
        fn objc_msgSend();
    }

    pub fn set_badge(badge: Option<&str>) {
        unsafe {
            type MsgSendGet = unsafe extern "C" fn(*mut std::ffi::c_void, *mut std::ffi::c_void) -> *mut std::ffi::c_void;
            type MsgSendSet = unsafe extern "C" fn(*mut std::ffi::c_void, *mut std::ffi::c_void, *mut std::ffi::c_void);
            type MsgSendStr = unsafe extern "C" fn(*mut std::ffi::c_void, *mut std::ffi::c_void, *const c_char) -> *mut std::ffi::c_void;

            let msg_send_get: MsgSendGet = std::mem::transmute(objc_msgSend as *const ());
            let msg_send_set: MsgSendSet = std::mem::transmute(objc_msgSend as *const ());
            let msg_send_str: MsgSendStr = std::mem::transmute(objc_msgSend as *const ());

            let cls_nsapp = CString::new("NSApplication").unwrap();
            let sel_shared = CString::new("sharedApplication").unwrap();
            let sel_dock = CString::new("dockTile").unwrap();
            let sel_set_badge = CString::new("setBadgeLabel:").unwrap();
            let sel_display = CString::new("display").unwrap();
            let cls_str = CString::new("NSString").unwrap();
            let sel_str_with_utf8 = CString::new("stringWithUTF8String:").unwrap();

            let nsapp_class = objc_getClass(cls_nsapp.as_ptr());
            if nsapp_class.is_null() { return; }

            let shared_app = msg_send_get(nsapp_class, sel_registerName(sel_shared.as_ptr()));
            if shared_app.is_null() { return; }

            let dock_tile = msg_send_get(shared_app, sel_registerName(sel_dock.as_ptr()));
            if dock_tile.is_null() { return; }

            let set_badge_sel = sel_registerName(sel_set_badge.as_ptr());

            match badge {
                Some(b) if !b.is_empty() => {
                    let b_cstring = CString::new(b).unwrap();
                    let ns_str_class = objc_getClass(cls_str.as_ptr());
                    let ns_string = msg_send_str(
                        ns_str_class,
                        sel_registerName(sel_str_with_utf8.as_ptr()),
                        b_cstring.as_ptr(),
                    );
                    msg_send_set(dock_tile, set_badge_sel, ns_string);
                }
                _ => {
                    let nil_ptr: *mut std::ffi::c_void = std::ptr::null_mut();
                    msg_send_set(dock_tile, set_badge_sel, nil_ptr);
                }
            }

            let sel_disp = sel_registerName(sel_display.as_ptr());
            msg_send_get(dock_tile, sel_disp);
        }
    }
}

#[tauri::command]
pub fn set_dock_badge(badge: Option<String>) {
    #[cfg(target_os = "macos")]
    {
        macos_dock::set_badge(badge.as_deref());
    }
}
