# LangFlip Desktop — TODO & Future Enhancements

## 🚀 Immediate Next Steps (Before v1.0 Final Release)

### Critical
- [ ] **Test on multiple Windows versions** (10, 11)
  - Verify hotkey registration works on all versions
  - Test system tray icon rendering
  - Test clipboard access in various contexts

- [ ] **Test with various applications**
  - Notepad (basic)
  - Microsoft Word (complex)
  - Chrome / Firefox (web)
  - Visual Studio (code editor)
  - WhatsApp Desktop (chat)
  - Password managers (should ignore)

- [ ] **Keyboard mapping refinement**
  - Add support for Hebrew numbers mapping (optional)
  - Add support for common symbols
  - Test with actual Hebrew keyboards
  - Document any limitations

- [ ] **OpenAI integration testing**
  - Test API key validation
  - Test translation quality
  - Test error handling (rate limits, API errors)
  - Test timeout handling
  - Verify token counting (for cost awareness)

- [ ] **Privacy & Security audit**
  - Verify API keys are properly encrypted
  - Ensure no sensitive data in logs
  - Check clipboard restoration works correctly
  - Verify password field detection

### Important
- [ ] **Installer creation**
  - Create MSI installer using WiX
  - Add "Start with Windows" shortcut to startup folder
  - Add uninstaller
  - Create release notes

- [ ] **Documentation completion**
  - Add troubleshooting guide
  - Add FAQ section
  - Create video tutorials
  - Add screenshot examples

- [ ] **Localization**
  - Complete Hebrew resource file (he-IL.resx)
  - Complete English resource file (en-US.resx)
  - Test RTL/LTR switching
  - Test with both languages in UI

- [ ] **Error handling edge cases**
  - Handle clipboard unavailable gracefully
  - Handle hotkey registration failure
  - Handle API timeouts
  - Handle invalid UTF-8 text

### Nice to Have
- [ ] **Branding assets**
  - Create application icon (16x16, 32x32, 64x64, 256x256)
  - Create window icon
  - Create installer splash screen
  - Create logo for website

- [ ] **User analytics** (optional, off by default)
  - Track feature usage (without sending text)
  - Track error rates
  - Provide opt-in feedback form

---

## 📋 v1.5 Features

### High Priority
- [ ] **Customizable keyboard shortcuts**
  - UI to rebind hotkeys
  - Save custom bindings to settings
  - Validate key conflicts
  - Reset to defaults button

- [ ] **Better app-specific support**
  - Detect active application
  - Use app-specific text retrieval methods
  - Special handling for:
    - Microsoft Word (Word Object Model)
    - Outlook (Exchange API)
    - Chrome (accessibility features)
    - WhatsApp Desktop

- [ ] **Smart keyboard layout detection**
  - Auto-detect if text is typed with wrong layout
  - Suggest fix before user presses action button
  - Optional auto-correction mode (off by default)

- [ ] **Optional history** (off by default)
  - Store last N actions (configurable)
  - Quick re-do previous translation
  - Local storage only, encrypted
  - Clear history button

- [ ] **Multiple writing tones** (requires better prompts)
  - Improve as: Professional, Casual, Formal, Creative
  - UI selector for tone
  - Different prompts per tone

### Medium Priority
- [ ] **Floating menu improvements**
  - Keyboard arrow navigation
  - Recent actions history
  - Customizable button layout

- [ ] **Clipboard format preservation**
  - Detect if clipboard has rich text
  - Preserve formatting if possible
  - Add "Copy as plain text" option

- [ ] **Translation memory** (optional)
  - Learn from user translations
  - Suggest consistent terms
  - Improve translation quality over time
  - Users can create glossaries

- [ ] **DeepL provider integration**
  - Implement `DeepLTranslationProvider`
  - Add DeepL to settings
  - Test translation quality
  - Handle free tier limitations

- [ ] **Settings export/import**
  - Export current settings to JSON
  - Import settings from another machine
  - Share settings with team (v2.0)

### Lower Priority
- [ ] **Dark/Light theme toggle**
  - Create light glassmorphism theme
  - Add settings UI toggle
  - Remember user preference

- [ ] **Accessibility improvements**
  - Screen reader support (JAWS, NVDA)
  - Keyboard-only navigation
  - High contrast mode
  - Larger font option

---

## 🎯 v2.0 Major Features

### Browser Extension
- [ ] **Chrome/Edge Extension**
  - Same features as desktop app
  - Works on any website
  - Right-click context menu integration
  - Floating menu for selected text
  - Synchronized settings with desktop

### Office Integration
- [ ] **Microsoft Word Add-in**
  - Sidebar interface
  - Highlight-and-correct workflow
  - Integration with Word styles
  - Comments for suggestions

- [ ] **Outlook Add-in**
  - Translate/improve emails before sending
  - Check spelling in other languages
  - Keyboard shortcut support

### Platform Expansion
- [ ] **macOS version**
  - Use native Swift/Objective-C for UI
  - System-level keyboard shortcuts
  - Finder integration
  - macOS keyboard mapping

- [ ] **Linux version** (GNOME/KDE)
  - GTK or Qt UI
  - System tray support
  - X11 hotkey registration

### Advanced Features
- [ ] **Translation memory with ML**
  - Learn from user edits
  - Suggest better translations
  - Custom glossary/domain support

- [ ] **Offline translation**
  - Local LLM (e.g., Ollama, LM Studio)
  - No internet required for translation
  - Privacy-first approach
  - Optional cloud fallback

- [ ] **Batch processing**
  - Translate multiple files
  - Batch keyboard correction
  - Process text files in bulk

- [ ] **Advanced writing analytics**
  - Readability score
  - Tone detection
  - Complexity analysis
  - Suggestions for improvement

- [ ] **Team collaboration** (Cloud)
  - Shared glossaries
  - Team settings sync
  - Translation review workflow
  - Usage analytics & billing

---

## 🔧 Technical Debt & Refactoring

### Current Known Issues
- [ ] **WndProc for hotkey handling** not yet implemented
  - Currently using placeholder
  - Need to subclass Window for proper message handling
  - Research HwndSource approach

- [ ] **TextPattern.Pattern may not be available** in all controls
  - Need to handle gracefully
  - Fall back to clipboard method

- [ ] **AES encryption key is hardcoded**
  - Should use DPAPI or Windows Credential Manager
  - Future security improvement

### Code Improvements
- [ ] **Add comprehensive unit tests**
  - KeyboardLayoutService tests
  - ActionService tests
  - TranslationService tests
  - Settings encryption/decryption tests

- [ ] **Add integration tests**
  - Full workflow tests
  - API integration tests
  - Settings save/load tests

- [ ] **Refactor for MVVM pattern**
  - Move UI logic to ViewModels
  - Use binding instead of code-behind
  - Easier to test and maintain

- [ ] **Add logging framework**
  - Use Serilog or similar
  - Structured logging
  - Debug vs release configurations
  - Optional telemetry (off by default)

- [ ] **Performance optimization**
  - Profile memory usage
  - Optimize keyboard mapping dictionary (currently O(1) lookup)
  - Cache frequently used translations
  - Lazy load UI components

---

## 📝 Documentation

### User Documentation
- [ ] **User manual** (PDF)
  - Getting started guide
  - Keyboard shortcuts reference
  - Settings explained
  - Troubleshooting guide
  - FAQ

- [ ] **Video tutorials**
  - Installation & setup
  - Basic usage
  - Keyboard correction workflow
  - Translation workflow
  - Settings configuration

- [ ] **Blog/articles**
  - "How to fix keyboard layout mistakes"
  - "Choosing a translation provider"
  - "Privacy-first text processing"

### Developer Documentation
- [ ] **API documentation** (XML comments)
  - Add comprehensive docs to all public methods
  - Generate API docs with DocFX

- [ ] **Architecture diagrams**
  - Service dependency graph
  - Data flow diagrams
  - UI component hierarchy

- [ ] **Contributing guide**
  - How to report bugs
  - How to request features
  - Development workflow
  - Code review process

---

## 🌍 Localization

### Currently Supported
- [x] Hebrew (he-IL)
- [x] English (en-US)

### Planned
- [ ] Russian (ru-RU)
- [ ] Arabic (ar-SA)
- [ ] German (de-DE)
- [ ] French (fr-FR)
- [ ] Spanish (es-ES)
- [ ] Portuguese (pt-BR)
- [ ] Chinese (zh-CN)
- [ ] Japanese (ja-JP)

---

## 🧪 Testing Roadmap

### Unit Tests
- [ ] KeyboardLayoutService: 100% coverage
- [ ] ClipboardService: 100% coverage
- [ ] SettingsService: 100% coverage
- [ ] TextDirection detection: 100% coverage

### Integration Tests
- [ ] Full action execution flow
- [ ] Settings save/load
- [ ] API provider integration

### End-to-End Tests
- [ ] Manual testing on Windows 10 & 11
- [ ] Test in various applications
- [ ] Test with different API providers

### Compatibility Tests
- [ ] .NET 8.0 on Windows 10
- [ ] .NET 8.0 on Windows 11
- [ ] Various system configurations (low RAM, high DPI)
- [ ] Accessibility tool compatibility

---

## 📊 Analytics & Monitoring (Optional, v1.5+)

### Optional Telemetry (Off by Default)
- [ ] Feature usage tracking
  - Which actions used most
  - Which providers used
  - Typical text length

- [ ] Error tracking
  - Common failure cases
  - API errors
  - Performance issues

- [ ] User feedback
  - Optional satisfaction survey
  - Feature request form
  - Bug report form

### Implementation
- [ ] Choose telemetry provider (PostHog, Amplitude, etc.)
- [ ] Implement opt-in prompt
- [ ] Add settings toggle
- [ ] Ensure GDPR compliance
- [ ] Document privacy practices

---

## 🚀 Distribution & Updates

### v1.0 Release
- [ ] Publish to GitHub releases
- [ ] Create installer
- [ ] Write release notes
- [ ] Announce on social media

### Future
- [ ] Windows Package Manager (winget)
- [ ] Microsoft Store (with auto-update)
- [ ] Chocolatey package
- [ ] Auto-update mechanism

---

## 🎓 Learning & Research

### Areas to Explore
- [ ] Windows accessibility improvements
- [ ] Better Hebrew text processing
- [ ] Keyboard layout standards (ISO 3471)
- [ ] UI Automation API improvements
- [ ] Performance profiling
- [ ] Security best practices for desktop apps

### References to Study
- [Microsoft UI Automation](https://learn.microsoft.com/dotnet/api/system.windows.automation)
- [WPF Performance](https://learn.microsoft.com/archive/msdn-magazine/2015/february/wpf-performance-profiling)
- [Hebrew Typography](https://www.w3.org/International/articles/hebrew/text)
- [Win32 API](https://learn.microsoft.com/windows/win32/api/)

---

## 🤝 Community & Contributions

### Welcome Contributions
- [ ] Bug fixes
- [ ] Feature implementations
- [ ] Documentation improvements
- [ ] Localization (new languages)
- [ ] Testing & QA

### Contributors Guide
- [ ] Create CONTRIBUTING.md
- [ ] Set up GitHub issues templates
- [ ] Code review process
- [ ] Community guidelines

---

## 📈 Success Metrics

### User Adoption
- [ ] Downloads per month
- [ ] Active users
- [ ] GitHub stars
- [ ] User feedback score

### Product Quality
- [ ] Bug report rate
- [ ] Feature request rate
- [ ] User satisfaction rating
- [ ] Performance benchmarks

---

## 🎉 Future Vision (Year 2+)

- Become the go-to tool for Hebrew-English text processing
- Support 10+ languages
- 50K+ monthly active users
- Available on all platforms (Windows, Mac, Linux)
- Browser extensions and office integrations
- Community-driven glossaries and translation memories
- Educational use in schools and universities
- Team/enterprise features

---

**Last Updated**: June 2024  
**Next Review**: September 2024
