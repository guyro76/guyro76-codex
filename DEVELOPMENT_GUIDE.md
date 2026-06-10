# LangFlip Desktop — Development Guide

This guide is for developers who want to understand, extend, or contribute to LangFlip Desktop.

---

## 📐 Architecture Overview

### Service Layer Pattern

LangFlip uses a **service-based architecture** where each service handles one specific concern:

```
App.xaml.cs (Initialization & Orchestration)
    ↓
HotkeyManager (Global hotkeys)
TrayService (System tray)
FloatingMenu (Quick actions)
    ↓
ActionService (Orchestrator)
    ↓
├─ KeyboardLayoutService (Local keyboard mapping)
├─ TranslationService (AI wrapper)
│  └─ OpenAITranslationProvider (OpenAI API)
├─ ClipboardService (Safe clipboard ops)
├─ SelectedTextService (Read selected text)
└─ SettingsService (Local encrypted storage)
```

### Data Flow

```
User Action (Hotkey/Menu/Button)
    ↓
HotkeyManager.OnHotKeyPressed()
    ↓
App.ExecuteAction(ActionType)
    ↓
SelectedTextService.GetSelectedTextAsync()
    ↓
ActionService.ExecuteActionAsync(text, action)
    ↓
[KeyboardService | TranslationService]
    ↓
ClipboardService or PreviewWindow
    ↓
Result displayed to user
```

---

## 🧩 Understanding Each Service

### 1. KeyboardLayoutService

**Responsibility**: Convert between QWERTY and Hebrew keyboard layouts.

**Key Methods**:
- `ConvertToHebrew(string)`: QWERTY → Hebrew
- `ConvertToEnglish(string)`: Hebrew → QWERTY
- `DetectTextDirection(string)`: Detect if text is RTL or LTR

**How It Works**:
- Uses bidirectional dictionary mapping
- Character-by-character replacement
- Preserves numbers, spaces, punctuation
- Case-insensitive mapping

**Example**:
```csharp
var service = new KeyboardLayoutService();
var result = service.ConvertToHebrew("akuo");  // "שלום"
```

**Extending**:
To add support for DVORAK or other layouts:
1. Create a new mapping dictionary
2. Add a parameter to specify layout
3. Use the appropriate mapping based on parameter

---

### 2. ClipboardService

**Responsibility**: Safe clipboard read/write operations with error handling.

**Key Methods**:
- `GetClipboardText()`: Read clipboard (silent fail returns empty)
- `SetClipboardText(string)`: Write to clipboard
- `CopyToClipboard(string)`: Alias for SetClipboardText
- `SaveAndClear()`: Save current content and clear
- `Restore(string)`: Restore previous content

**Why It's Important**:
- Clipboard can be unavailable in some contexts
- Handles exceptions gracefully
- Enables safe clipboard fallback for text selection

**Example**:
```csharp
var saved = clipboard.SaveAndClear();
// ... do work ...
clipboard.Restore(saved);
```

---

### 3. SelectedTextService

**Responsibility**: Read selected text from any Windows application.

**Strategy** (Multi-layer fallback):
1. **Primary**: Windows UI Automation API (reads text from focused control)
2. **Fallback 1**: Clipboard method (save→Ctrl+C→restore)
3. **Fallback 2**: Return null (user can copy manually)

**Key Method**:
- `GetSelectedTextAsync()`: Get selected text with fallback chain
- `ReplaceSelectedTextAsync(string)`: Replace selected text (sends Ctrl+V)

**Limitations**:
- Not all apps expose text via UI Automation (e.g., some password managers)
- Some apps may ignore clipboard operations
- Virtual keyboards not supported

**Testing**:
```csharp
var service = new SelectedTextService(clipboardService);
var selected = await service.GetSelectedTextAsync();
// Try with Notepad, Word, Chrome, etc.
```

---

### 4. TranslationService

**Responsibility**: Translate and improve text using configured AI provider.

**Public Methods**:
- `TranslateToEnglishAsync(string)`: Hebrew → English
- `TranslateToHebrewAsync(string)`: English → Hebrew
- `ImproveHebrewAsync(string)`: Improve Hebrew text
- `ImproveEnglishAsync(string)`: Improve English text
- `TestProviderConnectionAsync()`: Verify API connectivity

**How It Works**:
1. Checks `SettingsService` for configured provider & API key
2. Routes to appropriate provider (`ITranslationProvider`)
3. Provider handles actual API call
4. Returns translated text

**Example**:
```csharp
var service = new TranslationService(settingsService);
var english = await service.TranslateToEnglishAsync("שלום");
```

---

### 5. OpenAITranslationProvider

**Responsibility**: Integrate with OpenAI API for translation & improvement.

**Key Methods**:
- `TranslateAsync(string, string, string)`: Send request to OpenAI
- `TestConnectionAsync()`: Verify API key is valid

**How It Works**:
1. Constructs language-specific prompts
2. Calls OpenAI Chat Completions endpoint
3. Extracts and returns text from response
4. Handles errors gracefully

**Prompts Used**:
- **Translate to English**: "Translate the following Hebrew text to natural, fluent English..."
- **Translate to Hebrew**: "Translate the following English text to natural, fluent Hebrew..."
- **Improve**: Uses same prompt for self-improvement (may be enhanced in v1.5)

**Configuration**:
Requires OpenAI API key in settings. Get one at: https://platform.openai.com/api-keys

**Example**:
```csharp
var provider = new OpenAITranslationProvider("sk-...");
var translated = await provider.TranslateAsync("Hello", "English", "Hebrew");
```

---

### 6. SettingsService

**Responsibility**: Manage application settings with local encrypted storage.

**Key Methods**:
- `Get*()` / `Set*()`: Access individual settings
- `Save()`: Persist changes to disk

**Storage**:
- Location: `%APPDATA%\LangFlip\settings.json`
- Format: JSON
- Sensitive data (API keys): Encrypted with AES

**Settings Managed**:
- Result behavior (preview/replace/copy)
- Translation provider & API key
- Privacy options (text storage, password fields)
- UI preferences (language, theme, motion)

**Example**:
```csharp
var settings = new SettingsService();
settings.SetTranslationApiKey("sk-...");
settings.SetResultMode(ResultMode.PreviewBeforeReplace);
settings.Save();
```

**Security Note**:
API keys are encrypted with a hardcoded AES key. For production, consider:
1. Using Windows Data Protection API (DPAPI) instead
2. Storing secrets in Windows Credential Manager
3. Using environment variables

---

### 7. ActionService

**Responsibility**: Orchestrate services to execute user actions.

**Key Method**:
- `ExecuteActionAsync(string, ActionType)`: Main entry point

**Flow**:
1. Validate input (check if text is empty)
2. Route to appropriate handler based on ActionType
3. Call appropriate service (KeyboardService, TranslationService)
4. Return ActionResult with success status, original text, result text

**Example**:
```csharp
var service = new ActionService(keyboard, clipboard, settings, translation);
var result = await service.ExecuteActionAsync("akuo", ActionType.ConvertToHebrew);
// result.Success = true
// result.ResultText = "שלום"
```

---

### 8. HotkeyManager

**Responsibility**: Register and handle global system hotkeys.

**Key Methods**:
- `RegisterDefaultHotkeys()`: Register all default shortcuts
- `UnregisterAllHotkeys()`: Clean up before exit
- `OnHotKeyPressed(int)`: Called by WndProc when hotkey is triggered

**How It Works**:
1. Uses Win32 `RegisterHotKey` API for system-level hotkeys
2. Hotkeys work even when app is minimized (if main window exists)
3. Events fired when hotkey is pressed
4. App listens to events and executes actions

**Default Hotkeys**:
- Ctrl+Alt+H → ConvertToHebrew
- Ctrl+Alt+E → ConvertToEnglish
- Ctrl+Alt+T → TranslateToHebrew (auto-detect)
- Ctrl+Alt+Shift+E → TranslateToEnglish
- Ctrl+Alt+Shift+H → TranslateToHebrew
- Ctrl+Alt+I → ImproveEnglish
- Ctrl+Alt+Space → Show floating menu

**Customization**:
Edit `HotkeyManager.RegisterDefaultHotkeys()` to change shortcuts.

---

### 9. TrayService

**Responsibility**: Manage system tray icon and context menu.

**Key Features**:
- Tray icon with app icon
- Context menu with all actions
- Enable/disable toggle
- Settings and Exit options
- Events for action selection

**How It Works**:
1. Creates `NotifyIcon` (system tray)
2. Builds context menu with action items
3. Handles mouse clicks
4. Fires events when actions are selected

**Customization**:
Edit `SetupContextMenu()` to add/remove menu items.

---

## 🔄 Adding a New Action

Let's say you want to add "Capitalize Text" action.

### Step 1: Add to Enum
**File**: `Core/Enums/ActionType.cs`
```csharp
public enum ActionType
{
    // ... existing ...
    CapitalizeText  // NEW
}
```

### Step 2: Implement Logic
**File**: `Services/TextFormatService.cs` (new file)
```csharp
public class TextFormatService
{
    public string CapitalizeText(string text)
    {
        return System.Globalization.CultureInfo.CurrentCulture
            .TextInfo.ToTitleCase(text);
    }
}
```

### Step 3: Add to ActionService
**File**: `Services/ActionService.cs`
```csharp
public ActionService(
    // ... existing ...
    TextFormatService textFormatService)
{
    // ...
    _textFormatService = textFormatService;
}

public async Task<ActionResult> ExecuteActionAsync(string selectedText, ActionType action)
{
    var result = action switch
    {
        // ... existing ...
        ActionType.CapitalizeText => HandleCapitalizeText(selectedText),
        _ => throw new ArgumentException("Unknown action type")
    };
    return result;
}

private ActionResult HandleCapitalizeText(string text)
{
    var capitalized = _textFormatService.CapitalizeText(text);
    return new ActionResult
    {
        Success = true,
        OriginalText = text,
        ResultText = capitalized,
        ResultDirection = TextDirection.LTR
    };
}
```

### Step 4: Register Hotkey
**File**: `Services/HotkeyManager.cs`
```csharp
public void RegisterDefaultHotkeys()
{
    // ... existing ...
    RegisterHotkey(MOD_CTRL | MOD_ALT | MOD_SHIFT, VK_C, ActionType.CapitalizeText);
}
```

### Step 5: Add UI Button
**File**: `UI/MainWindow.xaml`
```xml
<Button Content="הפוך לאותיות גדולות" Style="{StaticResource GlassButton}" Click="Button_Capitalize" />
```

**File**: `UI/MainWindow.xaml.cs`
```csharp
private void Button_Capitalize(object sender, RoutedEventArgs e)
{
    ActionRequested?.Invoke(this, ActionType.CapitalizeText);
}
```

### Step 6: Add to Tray Menu
**File**: `Services/TrayService.cs`
```csharp
private void SetupContextMenu()
{
    // ... in SetupContextMenu() ...
    var capitalizeItem = new ToolStripMenuItem("הפוך לאותיות גדולות");
    capitalizeItem.Click += (s, e) => ActionRequested?.Invoke(this, ActionType.CapitalizeText);
    _contextMenu.Items.Add(capitalizeItem);
}
```

### Step 7: Add Initialization to App
**File**: `App.xaml.cs`
```csharp
private void InitializeServices()
{
    // ... existing ...
    var textFormatService = new TextFormatService();
    // Pass to ActionService
}
```

---

## 🧪 Testing Services Independently

### Test KeyboardService
```csharp
[TestMethod]
public void TestConvertToHebrew()
{
    var service = new KeyboardLayoutService();
    var result = service.ConvertToHebrew("akuo");
    Assert.AreEqual("שלום", result);
}
```

### Test ActionService
```csharp
[TestMethod]
public async Task TestExecuteAction()
{
    var result = await actionService.ExecuteActionAsync(
        "Hello",
        ActionType.ConvertToHebrew
    );
    Assert.IsTrue(result.Success);
    Assert.IsNotEmpty(result.ResultText);
}
```

### Test Translation
```csharp
[TestMethod]
public async Task TestTranslation()
{
    var provider = new OpenAITranslationProvider("sk-...");
    var isValid = await provider.TestConnectionAsync();
    Assert.IsTrue(isValid);
}
```

---

## 🎨 UI Development Notes

### WPF Resources & Styles
- **GlassButton**: Main action button style (blue/cyan theme)
- **StatusCard**: Information card style (dark with border)
- **PreviewTextBox**: Read-only text display

### RTL Support
For Hebrew windows:
```xml
<Window FlowDirection="RightToLeft">
    <TextBlock TextAlignment="Right" />
    <StackPanel Orientation="Horizontal" HorizontalAlignment="Right" />
</Window>
```

### Glassmorphism Design
- Semi-transparent backgrounds (Opacity 0.9-0.95)
- Blue & cyan accent colors (#2563EB, #38D5FF)
- Soft borders (#1E3A5F for dark)
- Rounded corners (CornerRadius 8-12)
- Subtle shadows via BorderBrush

---

## 🐛 Debugging Tips

### Enable Verbose Logging
Add this to your service constructors:
```csharp
System.Diagnostics.Debug.WriteLine($"[Service] Initializing {GetType().Name}");
```

### Debug Hotkeys
Check Windows event viewer under:
- Applications and Services Logs → Windows → Application

### Debug Clipboard
```csharp
var text = System.Windows.Forms.Clipboard.GetText();
System.Diagnostics.Debug.WriteLine($"Clipboard: {text}");
```

### Debug Settings
Check `%APPDATA%\LangFlip\settings.json` directly (but API keys are encrypted).

---

## 🚀 Building & Deploying

### Build for Release
```bash
dotnet build -c Release
```

### Create Installer
For v1.5+, consider:
- **WiX Toolset**: MSI installer with auto-update
- **NSIS**: Lightweight installer
- **ClickOnce**: Built-in .NET deployment

### Manual Build Steps
1. Ensure all dependencies are installed: `dotnet restore`
2. Build: `dotnet build -c Release`
3. Output: `bin/Release/net8.0-windows10.0.19041.0/`
4. Run: `LangFlipDesktop.exe`

---

## 📋 Code Style Guide

### Naming Conventions
- Classes: `PascalCase` (KeyboardLayoutService)
- Methods: `PascalCase` (ConvertToHebrew)
- Variables: `camelCase` (selectedText, isEnabled)
- Private fields: `_camelCase` (_clipboardService)
- Constants: `UPPER_CASE` (MOD_CTRL)

### File Organization
```csharp
using statements;

namespace LangFlipDesktop.Services;

public class MyService : IMyInterface
{
    private readonly IDependent _dependent;

    public MyService(IDependent dependent)
    {
        _dependent = dependent;
    }

    public void PublicMethod() { }

    private void PrivateMethod() { }
}
```

### Comments
- Write code that needs no comments (self-documenting)
- Comments only for "why", not "what"
- Example:
  ```csharp
  // Convert to Hebrew using QWERTY mapping (not phonetic)
  return ConvertQwertyToHebrew(text);
  ```

---

## 🔗 Dependencies & Libraries

### Core Dependencies
- **System.Windows.Forms**: Clipboard, SendKeys, NotifyIcon
- **System.Automation**: UI Automation for text selection
- **System.Security.Cryptography**: AES encryption for settings
- **CommunityToolkit.MVVM**: (Optional, for future MVVM refactor)

### Optional (Future)
- **OpenAI SDK**: Once officially released (currently using HTTP)
- **Serilog**: Structured logging
- **Spectre.Console**: Terminal UI for CLI version
- **CommunityToolkit.WinUI**: Advanced UI controls

---

## 📚 Further Reading

- [WPF Documentation](https://learn.microsoft.com/dotnet/desktop/wpf)
- [Win32 Hotkeys](https://learn.microsoft.com/windows/win32/api/winuser/nf-winuser-registerhhotkey)
- [UI Automation](https://learn.microsoft.com/dotnet/api/system.windows.automation)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Hebrew Typography Best Practices](https://www.w3.org/International/questions/qa-html-dir)

---

## 🎯 Next Steps

1. **Set up development environment**:
   - Install Visual Studio 2022 or VS Code + C# extension
   - Clone repository
   - Run `dotnet restore && dotnet build`

2. **Get an OpenAI API key**:
   - Visit https://platform.openai.com/api-keys
   - Create key
   - Add to settings via UI

3. **Test keyboard correction**:
   - Run app, open Notepad
   - Select "akuo" and press Ctrl+Alt+H
   - Should convert to "שלום"

4. **Test translation**:
   - Enter API key in Settings
   - Select Hebrew text
   - Press Ctrl+Alt+T
   - Should translate to English

5. **Explore the codebase**:
   - Start with `App.xaml.cs` (entry point)
   - Read `ActionService.cs` (orchestration)
   - Check service implementations

---

Happy coding! 🚀
