# LangFlip Desktop — Project Index

**Your complete guide to understanding, building, and extending this application.**

---

## 🚀 **Start Here**

**New to the project?**
1. Read this file (you're here!)
2. Read **QUICKSTART.md** (5 minutes to get running)
3. Open the app and test keyboard correction
4. Read **README.md** for full feature overview

**Have an API key?**
1. Get OpenAI API key from: https://platform.openai.com/api-keys
2. Follow QUICKSTART.md Step 3
3. Test translation with Ctrl+Alt+T

**Want to develop?**
1. Read **DEVELOPMENT_GUIDE.md** (service architecture)
2. Start with App.xaml.cs (entry point)
3. Read KeyboardLayoutService.cs (core logic)
4. Pick a task from TODO.md

---

## 📚 **Documentation by Role**

### **👤 Users**
| Document | What | Read if... |
|----------|------|-----------|
| QUICKSTART.md | Get running in 5 min | You want to test the app immediately |
| README.md | Feature overview | You want to understand what LangFlip does |
| CONFIGURATION.md | All settings explained | You want to customize behavior |
| TESTING.md | Test procedures | You're doing QA |

### **👨‍💻 Developers**
| Document | What | Read if... |
|----------|------|-----------|
| QUICKSTART.md | Build & run | You're new to the project |
| DEVELOPMENT_GUIDE.md | Service documentation | You want to understand the code |
| README.md | Architecture section | You want big-picture understanding |
| TODO.md | What to build next | You want to extend the application |

### **🔧 DevOps / Release**
| Document | What | Read if... |
|----------|------|-----------|
| README.md | Deployment section | You're creating an installer |
| TODO.md | v1.5+ planning | You're planning the next release |
| CONFIGURATION.md | All settings | You need to document configuration |
| build.sh / build.bat | Build scripts | You're automating builds |

---

## 🗂️ **File Guide**

### **Core Application**

```
App.xaml / App.xaml.cs
├─ Entry point for the application
├─ Initializes all services (dependency injection)
├─ Sets up hotkeys and system tray
├─ Handles action execution and UI coordination
└─ Read first to understand the flow
```

### **Services (Core Logic)**

```
Services/
├─ KeyboardLayoutService.cs ..................... ✓ QWERTY ↔ Hebrew mapping
├─ ClipboardService.cs .......................... ✓ Safe clipboard operations
├─ SelectedTextService.cs ....................... ✓ Read selected text
├─ TranslationService.cs ........................ ✓ AI wrapper
├─ OpenAITranslationProvider.cs ................. ✓ OpenAI integration
├─ DeepLTranslationProvider.cs .................. 📋 Placeholder
├─ SettingsService.cs ........................... ✓ Encrypted storage
├─ ActionService.cs ............................. ✓ Orchestration
├─ HotkeyManager.cs ............................. ✓ Global hotkey registration
├─ HotkeyWindowHelper.cs ........................ ✓ WndProc message handling
└─ TrayService.cs .............................. ✓ System tray icon & menu
```

**Most important to understand:**
1. KeyboardLayoutService (simplest, core logic)
2. ActionService (orchestrates others)
3. SettingsService (manages configuration)

### **User Interface**

```
UI/
├─ MainWindow.xaml/cs ........................... Dashboard with quick actions
├─ SettingsWindow.xaml/cs ....................... Configuration dialog
├─ FloatingMenu.xaml/cs ......................... Quick-action menu (Ctrl+Alt+Space)
└─ PreviewWindow.xaml/cs ........................ Preview before replace
```

**UI architecture:**
- WPF (Windows Presentation Foundation)
- Glassmorphism theme (dark, blue/cyan/yellow)
- Hebrew RTL support throughout
- Responsive, smooth animations

### **Core Models & Enums**

```
Core/
├─ Enums/
│  ├─ ActionType.cs ............................. What action to perform
│  ├─ ResultMode.cs ............................. How to show results
│  └─ TranslationProvider.cs .................... Which AI provider
├─ Models/
│  ├─ ActionResult.cs ........................... Result of an action
│  └─ TextDirection.cs .......................... RTL vs LTR
└─ Interfaces/
   ├─ IKeyboardLayoutService.cs
   ├─ ITranslationProvider.cs
   ├─ IClipboardService.cs
   ├─ ISelectedTextService.cs
   ├─ ISettingsService.cs
   └─ IActionService.cs
```

### **Configuration & Project Files**

```
├─ LangFlipDesktop.csproj ....................... Project configuration (.NET 8.0)
├─ .gitignore ................................... Git ignore patterns
├─ build.sh ..................................... Build script (Linux/Mac)
└─ build.bat .................................... Build script (Windows)
```

### **Resources**

```
Resources/
└─ Strings.he-IL.resx ........................... Hebrew localization (40+ strings)
```

---

## 🔄 **Data Flow**

```
User Action
├─ Hotkey (Ctrl+Alt+H, E, T, etc.)
├─ System Tray Menu (right-click)
├─ Floating Menu (Ctrl+Alt+Space)
└─ Dashboard Button (click)
        ↓
HotkeyManager / TrayService / UI Button
        ↓
App.xaml.cs:ExecuteAction()
        ↓
SelectedTextService.GetSelectedTextAsync()
    ├─ Try UI Automation (TextPattern.Pattern)
    ├─ Fallback: Clipboard (save→Ctrl+C→restore)
    └─ Return: string | null
        ↓
ActionService.ExecuteActionAsync(text, actionType)
        ├─ ConvertToHebrew → KeyboardLayoutService
        ├─ ConvertToEnglish → KeyboardLayoutService
        ├─ TranslateToEnglish → TranslationService
        ├─ TranslateToHebrew → TranslationService
        ├─ ImproveHebrew → TranslationService
        └─ ImproveEnglish → TranslationService
        ↓
ActionResult { Success, ResultText, ErrorMessage, Direction }
        ↓
Result Mode Handler (SettingsService.GetResultMode())
├─ PreviewBeforeReplace → Show PreviewWindow
├─ ReplaceInPlace → SelectedTextService.ReplaceSelectedTextAsync()
└─ CopyToClipboard → ClipboardService.CopyToClipboard()
        ↓
Display to User (Toast notification / Dialog)
```

---

## 🎯 **Quick Navigation**

### **I want to...**

**...understand the architecture**
→ Read: DEVELOPMENT_GUIDE.md (Architecture Overview section)

**...add a new action (e.g., Capitalize Text)**
→ Read: DEVELOPMENT_GUIDE.md (Adding a New Action section)

**...add a new translation provider (e.g., DeepL)**
→ Read: DEVELOPMENT_GUIDE.md (Adding a New Translation Provider section)

**...configure the application**
→ Read: CONFIGURATION.md

**...test the application**
→ Read: TESTING.md

**...see the roadmap**
→ Read: TODO.md

**...deploy/release the application**
→ Read: README.md (Deployment section) and TODO.md (v1.5 Installer)

**...understand the UI**
→ Look at: UI/*.xaml files (XAML markup) and Resources/Strings.he-IL.resx (strings)

**...debug an issue**
→ Read: DEVELOPMENT_GUIDE.md (Debugging Tips section)

**...contribute code**
→ Read: DEVELOPMENT_GUIDE.md (Code Style Guide) and README.md (Contributing)

---

## 📊 **Key Statistics**

| Metric | Value |
|--------|-------|
| **Total Code** | 2000+ lines (C# + XAML) |
| **Services** | 10 (all implemented) |
| **UI Windows** | 4 (Main, Settings, Float, Preview) |
| **Total Documentation** | 2500+ lines |
| **Test Cases** | 60+ |
| **Keyboard Mapping Entries** | 50+ |
| **Localization Strings** | 40+ |

---

## ✅ **Checklist for Getting Started**

- [ ] Read this INDEX.md file
- [ ] Read QUICKSTART.md (5 minutes)
- [ ] Run `dotnet restore && dotnet build`
- [ ] Run `dotnet run`
- [ ] Test keyboard correction (akuo → שלום)
- [ ] Read README.md
- [ ] Get OpenAI API key (optional)
- [ ] Configure API key in Settings (optional)
- [ ] Test translation (optional)
- [ ] Pick a task from TODO.md
- [ ] Read DEVELOPMENT_GUIDE.md for your task
- [ ] Start coding!

---

## 🔗 **Links**

### **Internal**
- README.md — Full feature overview and architecture
- QUICKSTART.md — Get running in 5 minutes
- DEVELOPMENT_GUIDE.md — For developers
- CONFIGURATION.md — All settings explained
- TESTING.md — QA testing guide
- TODO.md — Roadmap and tasks

### **External**
- [.NET 8.0 Documentation](https://learn.microsoft.com/dotnet/)
- [WPF Documentation](https://learn.microsoft.com/dotnet/desktop/wpf)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Windows UI Automation](https://learn.microsoft.com/dotnet/api/system.windows.automation)
- [Hebrew Typography Guide](https://www.w3.org/International/questions/qa-html-dir)

---

## 🎓 **Learning Path**

### **For Users**
1. QUICKSTART.md → Get app running
2. README.md → Understand features
3. CONFIGURATION.md → Customize behavior
4. Use the app daily!

### **For Developers**
1. QUICKSTART.md → Build and run
2. App.xaml.cs → Entry point
3. KeyboardLayoutService.cs → Simple logic
4. ActionService.cs → Orchestration
5. DEVELOPMENT_GUIDE.md → Deep dive
6. Pick task from TODO.md → Build something

### **For QA/Testers**
1. QUICKSTART.md → Get app running
2. TESTING.md → Test procedures
3. README.md → Feature overview
4. Run test cases from TESTING.md
5. Report issues with bug template

### **For DevOps/Release**
1. README.md → Project overview
2. build.sh / build.bat → Build scripts
3. TODO.md → v1.5 (installer section)
4. CONFIGURATION.md → User settings
5. Plan release cycle

---

## 💡 **Tips**

**Building the project:**
```bash
cd guyro76-codex
dotnet restore    # Download dependencies
dotnet build      # Compile (or use build.bat / build.sh)
dotnet run        # Run the app
```

**Understanding the code:**
- Start with App.xaml.cs (entry point)
- Follow the data flow from hotkey press to result display
- Read service comments (they explain the WHY)

**Adding features:**
- Create a service for new functionality
- Add interface in Core/Interfaces/
- Register in App.xaml.cs
- Add UI button/menu item
- Add test case to TESTING.md
- Document in DEVELOPMENT_GUIDE.md

**Debugging:**
- Use breakpoints in Visual Studio
- Check debug output window
- Read error messages carefully
- Check settings file: `%APPDATA%\LangFlip\settings.json`

---

## 📞 **Support**

**Documentation:**
- Find answers in the 6 main guides (README, QuickStart, Development, Configuration, Testing, TODO)
- Check DEVELOPMENT_GUIDE.md for "Debugging Tips"
- Check README.md for "Known Issues & Workarounds"

**Questions about a specific service:**
- Each service has detailed documentation in DEVELOPMENT_GUIDE.md

**Need to add a feature:**
- Follow the step-by-step guides in DEVELOPMENT_GUIDE.md

---

## 🎯 **Success Criteria**

After reading this INDEX, you should be able to:

✅ Understand the project structure  
✅ Know which document to read for any question  
✅ Build and run the application  
✅ Test keyboard correction (immediate, no setup)  
✅ Test translation (with API key)  
✅ Find any service in the codebase  
✅ Understand data flow from user action to result  
✅ Add new features following the patterns  
✅ Know the roadmap for future versions  

---

## 🚀 **Next Steps**

1. **Read QUICKSTART.md** (5 minutes)
2. **Build and run the app** (`dotnet run`)
3. **Test keyboard correction** (it works immediately)
4. **Read README.md** (understand all features)
5. **Pick a task from TODO.md** (start contributing)

---

**Everything is documented. Everything is organized. You have everything you need. Go build something great!** 🎉

---

**Last Updated**: June 2024  
**Project Status**: MVP Complete ✅  
**Ready for**: Development & Contribution 🚀
