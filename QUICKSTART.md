# LangFlip Desktop — Quick Start Guide

Get the app running in 5 minutes.

---

## 🚀 **Step 1: Build the Project**

```bash
cd guyro76-codex
dotnet restore
dotnet build
```

Expected output: `Build succeeded`

---

## 🧪 **Step 2: Test Without Translation (Works Immediately)**

1. **Run the app**:
   ```bash
   dotnet run
   ```

2. **Open Notepad** (or any text editor)

3. **Type some text**: `akuo`

4. **Select the text** (Ctrl+A)

5. **Press hotkey**: `Ctrl + Alt + H`

6. **Result**: Text converts to Hebrew `שלום`

✅ **Success!** Keyboard correction works offline.

---

## 🤖 **Step 3: Test Translation (Optional, Requires API Key)**

1. **Get OpenAI API Key**:
   - Go to: https://platform.openai.com/api-keys
   - Create a new API key
   - Copy it

2. **Run the app**: `dotnet run`

3. **Open Settings** (Click settings button in main window)

4. **Configure Translation**:
   - Select provider: **OpenAI**
   - Paste your API key
   - Click "Test Connection" (should say ✓ Connected)

5. **Test Translation**:
   - Open Notepad
   - Type Hebrew text: `שלום עולם`
   - Select it
   - Press: `Ctrl + Alt + T` (auto-detect and translate)
   - Result: Translates to English

✅ **Translation working!**

---

## 📚 **Step 4: Explore the App**

### Main Window
- Dashboard with quick action buttons
- Shortcuts reference
- Privacy information
- Settings button

### Hotkeys to Try
| Hotkey | Action |
|--------|--------|
| Ctrl+Alt+H | Convert to Hebrew |
| Ctrl+Alt+E | Convert to English |
| Ctrl+Alt+T | Auto-detect & translate |
| Ctrl+Alt+Space | Floating menu |

### Floating Menu (Ctrl+Alt+Space)
- Click near text
- Press Ctrl+Alt+Space
- Menu appears at cursor
- Select action
- Menu closes automatically

### Settings Window
- Result mode: Preview / Replace / Copy
- Provider selection
- Privacy settings
- Theme options

---

## 🧑‍💻 **Step 5: Explore the Code**

### Key Files to Read (in order)

1. **App.xaml.cs** (Entry point)
   - Initializes services
   - Sets up hotkeys
   - Orchestrates everything

2. **Services/KeyboardLayoutService.cs** (Core logic)
   - QWERTY ↔ Hebrew mapping
   - Character conversion
   - Most important for offline features

3. **Services/ActionService.cs** (Orchestration)
   - Routes actions to appropriate services
   - Handles all 6 action types

4. **Services/OpenAITranslationProvider.cs** (Translation)
   - Calls OpenAI API
   - Parses responses

5. **UI/MainWindow.xaml** (User interface)
   - Layout and design
   - Hebrew RTL support

### Architecture Overview

```
User Action (Hotkey/Menu)
    ↓
App.xaml.cs (orchestrator)
    ↓
ActionService.ExecuteAction()
    ↓
[KeyboardService | TranslationService]
    ↓
Return result
    ↓
Show to user (Preview/Replace/Copy)
```

---

## 📝 **Common Tasks**

### Test Keyboard Mapping
```csharp
var service = new KeyboardLayoutService();
var hebrew = service.ConvertToHebrew("akuo");  // "שלום"
var english = service.ConvertToEnglish("שלום"); // "akuo"
```

### Test Settings
```csharp
var settings = new SettingsService();
settings.SetTranslationApiKey("sk-...");
settings.SetResultMode(ResultMode.PreviewBeforeReplace);
settings.Save();
```

### Test Action
```csharp
var result = await actionService.ExecuteActionAsync(
    "שלום",
    ActionType.TranslateToEnglish
);
// result.Success = true
// result.ResultText = "Hello"
```

---

## 🐛 **Troubleshooting**

### Hotkeys Not Working
- Make sure main window is created (it's needed for hotkey registration)
- Try pressing hotkey after app is fully loaded (wait 2 seconds)
- Check if another app registered the same hotkey

### Text Selection Not Working
- Some apps don't support text reading (e.g., secure password managers)
- Try copying text manually first
- Use floating menu or main window buttons

### Translation Returns Error
- Check API key is valid (test in settings window)
- Check internet connection
- Check OpenAI API account has credits
- Check token limit (very long text may exceed limits)

### Settings Not Saving
- Check if `%APPDATA%\LangFlip\` folder exists
- Try running as Administrator
- Check disk space availability

---

## 📦 **What's Next?**

1. **Read the full README**: `README.md`
2. **Read development guide**: `DEVELOPMENT_GUIDE.md`
3. **Check roadmap**: `TODO.md`
4. **Start contributing**: Pick an item from TODO.md
5. **Create installer**: Use WiX (v1.5)
6. **Build extensions**: Browser extension (v2.0)

---

## 🎯 **Success Criteria**

After Quick Start, you should be able to:

✅ Build the project successfully  
✅ Run the app without errors  
✅ Convert text using keyboard shortcuts  
✅ Preview/replace/copy results  
✅ Access settings and tray menu  
✅ Read and understand the code structure  
✅ Know which files to modify for features  

---

## 📞 **Need Help?**

- Read **DEVELOPMENT_GUIDE.md** for detailed explanations
- Check **README.md** for features overview
- Look at **TODO.md** for what to build next
- All services are well-documented with comments

---

## 🎉 **You're Ready!**

The app is fully functional. Start exploring, testing, and building!

**Next**: Pick a feature from TODO.md and implement it! 🚀
