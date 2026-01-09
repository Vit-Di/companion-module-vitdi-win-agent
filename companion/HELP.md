# Windows Control Agent (by Vit-Di)

This module allows you to remotely control a Windows PC over the local network. 
It requires a companion Python Agent running on the target machine.

## ⚙️ Prerequisites & Setup

1.  **Download the Agent:** You need the `Win-Agent` software running on the target Windows PC.
2.  **Network:** Ensure the PC is reachable over the network.
3.  **Firewall:** Allow traffic on Port **8001** (TCP/HTTP) on the target PC.
4.  **Configuration:**
    * **Target IP:** Enter the local IP address of the Windows PC (e.g., `192.168.1.15`).
    * **Target Port:** Default is `8001`.

## 🚀 Actions

### System Power
* **Lock PC:** Locks the workstation immediately.
* **Sleep:** Puts the computer to sleep.
* **Reboot:** Restarts the PC (Option to force close apps).
* **Shutdown:** Turns off the PC (Option to force close apps).
* **Log Out:** Signs out the current user.

### App & Window Control
* **Start App (List):** Launch an application detected on the PC.
* **Start App (Manual):** Launch any `.exe` by path or command name.
* **Window Control:** Focus, Minimize, Maximize, Restore, or Close specific windows.
* **Kill Process:** Forcefully terminate a process (e.g., `obs64.exe`).
* **Open Website:** Opens a URL in the default browser.

### Input Simulation
* **Keyboard Press:** Press single keys (e.g., `Space`, `Enter`, `F5`).
* **Hotkeys:** Send combinations like `Ctrl+S`, `Alt+Tab`, `Win+D`.
* **Type Text:** Type a string of text (Supports Unicode).
* **Mouse:** Move cursor to X/Y coordinates, Left/Right/Double Click.

### System Utilities
* **Screenshot:** Take a full-screen screenshot or open Snipping Tool.
* **Virtual Desktop:** Switch between virtual desktops (Left/Right).
* **Utilities:** Open Task Manager, Device Manager, Settings, File Explorer.

---

## 📊 Variables

The module provides real-time statistics from the target PC:

* `$(win-agent:hostname)` - Computer Name.
* `$(win-agent:cpu_usage)` - Current CPU Load (%).
* `$(win-agent:ram_usage)` - Current RAM Usage (%).
* `$(win-agent:mouse_x)` - Mouse Cursor X Position.
* `$(win-agent:mouse_y)` - Mouse Cursor Y Position.
* `$(win-agent:agent_status)` - Connection status (Online/Offline).

---

## 🎨 Feedbacks

* **Process is Running:** Changes button color (e.g., Green) if a specific app (like OBS or vMix) is running.
* **CPU Usage (Traffic Light):** Changes color dynamically (Green -> Yellow -> Red) based on CPU load thresholds.
* **RAM Usage (Traffic Light):** Changes color dynamically based on RAM usage thresholds.
* **Agent Online:** Indicates if the module is successfully connected to the Python Agent.

---

## ⚠️ Troubleshooting

**Q: The module says "Offline" or "Connection Failure".**
* Check if the `Win-Agent.exe` is running on the target PC.
* Check if the IP address is correct.
* **Check Windows Firewall:** Ensure port 8001 is allowed for incoming connections.

**Q: "Start App" isn't listing my programs.**
* The module scans the PC every 60 seconds. Wait a minute or check if the app is installed in a standard location. You can always use "Manual Input" to launch via full path.

**Q: Volume or Sleep commands are not working.**
* Ensure `nircmd.exe` is located in the same folder as the Agent executable on the target PC.