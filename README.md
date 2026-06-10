# קליקשפה - LangFlip Desktop

A professional Windows desktop application that fixes wrong keyboard-layout typing, translates text between Hebrew and English, and improves writing quality—all in real-time across your applications.

**English**: LangFlip helps you work seamlessly across Hebrew and English by providing instant keyboard-layout correction, translation, and text improvement features accessible via global hotkeys, floating menus, and system tray integration.

---

## 🎯 Core Features

### 1. **Keyboard Layout Correction** (Local, Instant)
- **Convert English-layout typing to Hebrew**: `akuo` → `שלום`
- **Convert Hebrew-layout typing to English**: `שךםצ` → `shop`
- Works offline, instantly, no server communication
- Preserves numbers, spaces, and punctuation

### 2. **Translation** (AI-Powered)
- **Translate Hebrew → English**
- **Translate English → Hebrew**
- Supports OpenAI (v1.0), DeepL (v1.5+), Google Cloud (v2.0+)
- Only sends selected text to translation provider
- Privacy-first: Never stores text by default

### 3. **Writing Improvement** (AI-Powered)
- **Improve Hebrew writing**: Makes text clearer, more professional, more natural
- **Improve English writing**: Same for English

### 4. **Flexible Access**
- **Global Hotkeys**: Ctrl+Alt+H, Ctrl+Alt+E, Ctrl+Alt+T, etc.
- **Floating Quick-Action Menu**: Ctrl+Alt+Space near cursor
- **System Tray**: Right-click menu with all actions
- **Main Dashboard**: Manual action buttons

### 5. **Beautiful Glassmorphism UI**
- Dark theme with blue, cyan, and yellow accents
- Glassmorphism design (2026 premium SaaS style)
- Full RTL support for Hebrew
- Full LTR support for English
- Smooth animations and transitions

---

## 🚀 Getting Started

### Prerequisites
- Windows 10/11
- .NET 8.0 or newer
- C# development environment (Visual Studio 2022 recommended)

### Installation & Development

```bash
# Clone the repository
git clone <repo-url>
cd LangFlipDesktop

# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the application
dotnet run
```

### Project Structure

```
LangFlipDesktop/
├── LangFlipDesktop.csproj          # Project configuration
├── App.xaml / App.xaml.cs          # Main application entry
├── Core/
│   ├── Enums/                       # ActionType, ResultMode, TranslationProvider
│   ├── Interfaces/                  # Service contracts
│   └── Models/                      # TextDirection, ActionResult
├── Services/
│   ├── KeyboardLayoutService.cs     # English ↔ Hebrew keyboard mapping
│   ├── ClipboardService.cs          # Safe clipboard operations
│   ├── SelectedTextService.cs       # Read selected text (UI Automation + clipboard fallback)
│   ├── ActionService.cs             # Orchestrates all services
│   ├── SettingsService.cs           # Local settings storage (encrypted API keys)
│   ├── TranslationService.cs        # Translation wrapper
│   ├── HotkeyManager.cs             # Global hotkey registration
│   ├── TrayService.cs               # System tray icon & menu
│   └── TranslationProviders/
│       ├── OpenAITranslationProvider.cs
│       ├── DeepLTranslationProvider.cs (placeholder)
│       └── [Future providers]
├── UI/
│   ├── MainWindow.xaml/cs           # Main dashboard
│   ├── SettingsWindow.xaml/cs       # Settings dialog
│   ├── FloatingMenu.xaml/cs         # Quick-action menu
│   ├── PreviewWindow.xaml/cs        # Preview before replace
│   └── [Future UI components]
├── Resources/
│   ├── he-IL.resx                   # Hebrew localization
│   └── en-US.resx                   # English localization
└── README.md
```

---

## ⌨️ Keyboard Shortcuts (Default)

| Shortcut | Action |
|----------|--------|
| Ctrl+Alt+H | Convert selected text to Hebrew layout |
| Ctrl+Alt+E | Convert selected text to English layout |
| Ctrl+Alt+T | Auto-detect and translate (Hebrew↔English) |
| Ctrl+Alt+Shift+E | Translate to English |
| Ctrl+Alt+Shift+H | Translate to Hebrew |
| Ctrl+Alt+I | Improve English writing |
| Ctrl+Alt+Space | Open floating quick-action menu |

---

## 🎨 UI/UX Features

### Main Dashboard
- Status indicator (running in background)
- Quick action buttons for all 6 core actions
- Result mode selector (preview / replace / copy)
- Keyboard shortcuts reference
- Privacy & security badges
- Settings button

### Floating Menu
- Appears near cursor when triggered
- 6 action buttons in RTL layout
- Soft blur glassmorphism effect
- Keyboard navigation (Escape to close)
- Auto-close when clicking outside

### Settings Window
- General: Language, startup behavior, background mode
- Result behavior: Mode, clipboard restoration
- Translation: Provider selection, API key input, connection test
- Keyboard shortcuts: Future customization (v1.5+)
- Privacy: Text storage, password field protection, local-only correction
- Design: Theme, reduced motion, accent intensity

### Preview Window
- Shows original text (read-only)
- Shows result text (read-only, with proper direction)
- Replace, Copy, Cancel buttons
- Proper RTL/LTR text direction handling

---

## 🔒 Privacy & Security

✓ **Keyboard correction** runs 100% locally (offline)  
✓ **No text storage** by default (configurable)  
✓ **API keys encrypted** in local settings  
✓ **Password fields ignored** (can be enforced)  
✓ **Clipboard fallback** with optional restoration  
✓ **No analytics** by default  
✓ **No user accounts** required  
✓ **No cloud database** needed

**Privacy Statement**: LangFlip only sends selected text to your chosen translation provider (if enabled). Keyboard correction, text direction detection, and text improvement prompts are processed locally.

---

## 🔧 Configuration

### Settings File Location
```
%APPDATA%\LangFlip\settings.json
```

### Default Settings
```json
{
  "resultMode": "PreviewBeforeReplace",
  "restoreClipboard": true,
  "translationProvider": "None",
  "translationApiKey": "[encrypted]",
  "disableTextStorage": true,
  "ignorePasswordFields": true,
  "interfaceLanguage": "he",
  "startWithWindows": false,
  "runInBackground": true,
  "theme": "GlassDark",
  "reducedMotion": false
}
```

---

## 🛠️ Development

### Architecture Decisions

1. **Service-Based Architecture**: Clean separation of concerns
   - Each service has a single responsibility
   - Easy to test, extend, and replace

2. **Keyboard Correction**: Local QWERTY↔Hebrew mapping
   - Fast (instant, no latency)
   - Reliable (no dependencies)
   - Offline-capable

3. **Text Selection**: Multi-layer approach
   - Primary: Windows UI Automation
   - Fallback 1: Clipboard (save→Ctrl+C→restore)
   - Fallback 2: Read from clipboard directly

4. **Translation Providers**: Abstract interface pattern
   - Current: OpenAI API
   - Planned: DeepL, Google Cloud
   - Extensible for future providers

5. **Settings**: Encrypted local JSON storage
   - No cloud sync (v1.0)
   - API keys encrypted with AES
   - Safe to back up

6. **Global Hotkeys**: Win32 `RegisterHotKey` API
   - Works across all applications
   - System-level priority
   - No injection required

---

## ⚠️ Technical Limitations

### Text Selection
- **Not all apps support selection reading**: Some apps (e.g., secure password managers, protected PDFs) don't expose text via UI Automation
- **Fallback to clipboard method**: May not work in security-restricted environments
- **No right-click context menu in all apps**: Not all Windows apps allow external apps to inject context menus; LangFlip uses global hotkeys and floating menus instead as reliable alternatives

### Translation
- **Requires API key**: Translation features require an OpenAI API key (or future provider)
- **Internet required**: Translation and writing improvement need network access
- **Rate limiting**: API providers may impose rate limits
- **No offline translation**: v1.0 doesn't include local LLM support (planned for v2.0+)

### Keyboard Mapping
- **Basic QWERTY→Hebrew only**: Custom keyboard layouts not supported (v1.0)
- **English uppercase not mapped**: "Q" (uppercase) stays "Q" (mapping is case-insensitive)
- **Symbols**: Some symbol mappings may vary per keyboard layout

### Windows Features
- **Accessibility Features**: May interfere with text selection (e.g., Narrator, Magnifier)
- **Virtual Keyboards**: May not work with on-screen keyboards in some apps
- **Remote Desktop**: Hotkeys may not work on remote sessions (depends on RDP settings)

---

## 📋 MVP Scope (v1.0)

✅ Core application shell with WPF  
✅ Glassmorphism dark theme  
✅ Hebrew RTL & English LTR support  
✅ System tray integration  
✅ Global hotkey registration (Ctrl+Alt+H, E, T, etc.)  
✅ Keyboard layout correction (QWERTY↔Hebrew)  
✅ Clipboard fallback for text selection  
✅ Floating quick-action menu (Ctrl+Alt+Space)  
✅ Preview window (preview before replace)  
✅ Translation provider interface  
✅ OpenAI provider implementation  
✅ Settings window (comprehensive)  
✅ Privacy mode  
✅ Encrypted local settings storage  
✅ README & developer guide  

---

## 🗺️ Roadmap

### v1.5 (Next)
- Better app-specific support (Word, Outlook, Chrome, WhatsApp Desktop)
- Smart auto-detection of wrong keyboard layout
- Optional local history (off by default)
- Multiple writing tones (professional, casual, formal)
- Customizable keyboard shortcuts UI
- DeepL provider integration

### v2.0
- Chrome / Edge companion extension
- Microsoft Word / Outlook Add-in
- macOS version
- Translation memory (optional)
- User glossary for consistent terms
- Team settings sharing
- Automatic installer & auto-update

### Future
- Local LLM support (offline translation & improvement)
- Custom keyboard layout support
- Context-aware smart translation
- Translation quality scoring
- Browser history integration

---

## 🧪 Testing Checklist

### Keyboard Correction
- [ ] Convert English QWERTY text to Hebrew
- [ ] Convert Hebrew text back to English
- [ ] Preserve numbers and punctuation
- [ ] Handle mixed text (Hebrew + English)
- [ ] Preserve spaces and line breaks

### Text Selection
- [ ] Read selected text from various apps (Notepad, Word, Browser, etc.)
- [ ] Handle no selection gracefully
- [ ] Test in password fields (should be ignored)
- [ ] Test in protected/readonly fields

### Actions
- [ ] Convert to Hebrew via hotkey
- [ ] Convert to English via hotkey
- [ ] Translate to English (requires API key)
- [ ] Translate to Hebrew (requires API key)
- [ ] Improve writing (requires API key)
- [ ] Each action works via: hotkey, tray menu, floating menu, dashboard button

### UI
- [ ] Main window displays correctly
- [ ] Settings window opens/saves
- [ ] Floating menu appears at cursor
- [ ] Preview window shows original and result
- [ ] All buttons are responsive
- [ ] Hebrew text displays RTL correctly
- [ ] English text displays LTR correctly

### Privacy
- [ ] API key is encrypted in settings
- [ ] Text not stored by default
- [ ] Clipboard restoration works
- [ ] No data sent unless explicitly enabled

---

## 📝 Developer Notes

### Key Files to Understand

1. **KeyboardLayoutService.cs**: Core keyboard mapping logic
2. **SelectedTextService.cs**: Text selection with UI Automation + clipboard fallback
3. **ActionService.cs**: Orchestration logic for all actions
4. **HotkeyManager.cs**: Global hotkey registration using Win32 API
5. **App.xaml.cs**: Dependency injection & service initialization
6. **SettingsService.cs**: Encrypted settings storage

### Common Tasks

#### Add a New Translation Action
1. Add to `ActionType` enum
2. Implement handler in `ActionService`
3. Add button to UI
4. Register hotkey in `HotkeyManager`

#### Add a New Translation Provider
1. Implement `ITranslationProvider` interface
2. Add case in `TranslationService.InitializeProvider()`
3. Add provider to `TranslationProvider` enum
4. Add UI selector in `SettingsWindow`

#### Customize Hotkeys
Edit `HotkeyManager.RegisterDefaultHotkeys()` to change or add shortcuts.

#### Modify Theme Colors
Edit color values in XAML resource dictionaries (MainWindow.xaml, etc.)

---

## 🐛 Known Issues & Workarounds

1. **Text selection doesn't work in app X**
   - *Workaround*: Use clipboard fallback (copy text manually, then run action)
   - *Cause*: App doesn't expose text via UI Automation
   - *Solution*: Future app-specific integrations (v1.5+)

2. **Hotkeys don't work when app is minimized**
   - *Cause*: Windows requires hotkey window to be top-level (by design)
   - *Workaround*: Keep main window or tray icon accessible

3. **API key saved but not working**
   - *Cause*: Encryption/decryption mismatch (rare)
   - *Solution*: Clear settings.json and re-enter key

---

## 📞 Support & Feedback

For bug reports, feature requests, or questions:
- Create an issue in the repository
- Provide steps to reproduce
- Include Windows version and .NET version

---

## 📄 License

This project is provided as-is for educational and professional use.

---

## ✨ Credits

Built with ❤️ for the Hebrew and English-speaking developer community.

**Technology Stack:**
- C# / .NET 8.0
- WPF (Windows Presentation Foundation)
- Windows UI Automation API
- OpenAI API
- Glassmorphism design patterns

---

**קליקשפה** — Making text work seamlessly across languages.
