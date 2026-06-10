# LangFlip Desktop — Testing Guide

Comprehensive testing guide for QA engineers and developers.

---

## 🎯 **Test Environment Setup**

### Requirements
- Windows 10 or Windows 11
- .NET 8.0 Runtime installed
- Test text: Hebrew and English samples
- Optional: OpenAI API key for translation tests

### Sample Test Texts

**English**:
- Simple: "Hello world"
- Technical: "The algorithm processes data efficiently"
- Mixed: "עברית Hello עברית test"

**Hebrew**:
- Simple: "שלום עולם"
- Technical: "האלגוריתם עוצמת יעיל מאוד"
- Mixed: "This עברית mixed test"

**QWERTY mistype**:
- English → Hebrew: "akuo" should become "שלום"
- Hebrew → English: "שךםצ" should become "shop"

---

## 🧪 **Test Cases**

### Category 1: Keyboard Layout Correction

#### Test 1.1: Convert English QWERTY to Hebrew
```
INPUT: Select "akuo" in Notepad
ACTION: Press Ctrl+Alt+H
EXPECTED: Text converts to "שלום"
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 1.2: Convert Hebrew to English QWERTY
```
INPUT: Select "שלום" in Notepad
ACTION: Press Ctrl+Alt+E
EXPECTED: Text converts to "akuo"
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 1.3: Preserve Numbers
```
INPUT: Select "123 akuo 456" in Notepad
ACTION: Press Ctrl+Alt+H
EXPECTED: "123 שלום 456" (numbers preserved)
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 1.4: Preserve Punctuation
```
INPUT: Select "akuo!" in Notepad
ACTION: Press Ctrl+Alt+H
EXPECTED: "שלום!" (punctuation preserved)
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 1.5: Handle Spaces
```
INPUT: Select "akuo ehf" in Notepad
ACTION: Press Ctrl+Alt+H
EXPECTED: "שלום עולם" (spaces preserved)
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 1.6: Mixed Text
```
INPUT: Select "hello שלום world" in Notepad
ACTION: Press Ctrl+Alt+H
EXPECTED: "hello שלום world" OR all converted (acceptable)
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

---

### Category 2: Translation (Requires API Key)

#### Test 2.1: Translate Hebrew to English
```
INPUT: Configure OpenAI API key in Settings
SELECT: "שלום עולם" in Notepad
ACTION: Press Ctrl+Alt+Shift+E
EXPECTED: English translation appears in preview window
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 2.2: Translate English to Hebrew
```
SELECT: "Hello world" in Notepad
ACTION: Press Ctrl+Alt+Shift+H
EXPECTED: Hebrew translation appears in preview window
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 2.3: Auto-Detect Language
```
SELECT: "שלום עולם" in Notepad
ACTION: Press Ctrl+Alt+T (auto-detect)
EXPECTED: Detects Hebrew, translates to English
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 2.4: Auto-Detect English
```
SELECT: "Hello world" in Notepad
ACTION: Press Ctrl+Alt+T (auto-detect)
EXPECTED: Detects English, translates to Hebrew
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 2.5: API Key Invalid
```
INPUT: Set wrong API key in Settings
SELECT: Any text
ACTION: Press Ctrl+Alt+T
EXPECTED: Error message: "חסר API Key לתרגום" or similar
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 2.6: Long Text
```
SELECT: 500+ word text in English
ACTION: Press Ctrl+Alt+T
EXPECTED: Translation completes without error
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

---

### Category 3: UI & Navigation

#### Test 3.1: Main Window Displays
```
ACTION: Run dotnet run
EXPECTED: Main window opens with:
  - Title: "קליקשפה - LangFlip Desktop"
  - Status: "האפליקציה פעילה ברקע"
  - Quick action buttons visible
  - Settings button visible
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 3.2: Settings Window Opens
```
ACTION: Click Settings button in main window
EXPECTED: Settings dialog opens with:
  - General settings section
  - Translation provider dropdown
  - Privacy checkboxes
  - Save/Cancel buttons
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 3.3: Settings Save
```
ACTION: Open Settings
CHANGE: ResultMode to "ReplaceInPlace"
ACTION: Click Save
CLOSE: App completely
ACTION: Reopen app
EXPECTED: Setting persists (ReplaceInPlace selected)
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 3.4: Floating Menu Appears
```
ACTION: Press Ctrl+Alt+Space
EXPECTED: Menu appears near cursor with:
  - 6 action buttons
  - Glass effect visible
  - Hebrew RTL layout
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 3.5: Floating Menu Navigation
```
ACTION: Open floating menu (Ctrl+Alt+Space)
ACTION: Press Escape key
EXPECTED: Menu closes
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 3.6: Floating Menu Click Action
```
ACTION: Open floating menu
ACTION: Click any button
EXPECTED: Menu closes, action executes
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 3.7: System Tray Icon
```
ACTION: Run app
EXPECTED: Tray icon appears in system tray (bottom right)
ACTION: Right-click tray icon
EXPECTED: Context menu appears with actions
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 3.8: Tray Menu Actions
```
ACTION: Right-click tray icon
ACTION: Click "הפוך לעברית"
EXPECTED: Action executes (if text selected)
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

---

### Category 4: Text Selection

#### Test 4.1: Select Text from Notepad
```
APP: Notepad
TEXT: Type "hello world"
ACTION: Select text (Ctrl+A)
ACTION: Press Ctrl+Alt+H
EXPECTED: Text read successfully, converted
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 4.2: Select Text from Word
```
APP: Microsoft Word
TEXT: Type "hello world"
ACTION: Select text
ACTION: Press Ctrl+Alt+H
EXPECTED: Text read successfully, converted
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 4.3: Select Text from Browser
```
APP: Chrome/Firefox
PAGE: Any website with text
ACTION: Select some text on page
ACTION: Press Ctrl+Alt+H
EXPECTED: Text read successfully, converted
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 4.4: No Text Selected
```
APP: Notepad (empty or no selection)
ACTION: Press Ctrl+Alt+H
EXPECTED: Error message: "לא זוהה טקסט מסומן."
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 4.5: Password Field
```
APP: Any login form
ACTION: Click password field
ACTION: Type something
ACTION: Select the text
ACTION: Press Ctrl+Alt+H
EXPECTED: Action either ignored or warning shown
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

---

### Category 5: Result Modes

#### Test 5.1: Preview Mode
```
INPUT: Set ResultMode = "PreviewBeforeReplace"
ACTION: Select "akuo" and press Ctrl+Alt+H
EXPECTED: Preview window opens showing:
  - Original: "akuo"
  - Result: "שלום"
  - Replace/Copy/Cancel buttons
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 5.2: Preview Replace Button
```
ACTION: In preview window, click "החלף במקום"
EXPECTED: Text in original app replaced with result
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 5.3: Preview Copy Button
```
ACTION: In preview window, click "העתק"
EXPECTED: Result copied to clipboard
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 5.4: Preview Cancel Button
```
ACTION: In preview window, click "ביטול"
EXPECTED: Window closes, no changes made
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 5.5: Replace Mode
```
INPUT: Set ResultMode = "ReplaceInPlace"
ACTION: Select "akuo" and press Ctrl+Alt+H
EXPECTED: Text replaced immediately without preview
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 5.6: Copy Mode
```
INPUT: Set ResultMode = "CopyToClipboard"
ACTION: Select "akuo" and press Ctrl+Alt+H
EXPECTED: Result copied to clipboard
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

---

### Category 6: Hotkeys

#### Test 6.1: Ctrl+Alt+H (Convert to Hebrew)
```
ACTION: Select "akuo" in Notepad
ACTION: Press Ctrl+Alt+H
EXPECTED: Converts to Hebrew
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 6.2: Ctrl+Alt+E (Convert to English)
```
ACTION: Select "שלום" in Notepad
ACTION: Press Ctrl+Alt+E
EXPECTED: Converts to English
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 6.3: Ctrl+Alt+T (Auto-Detect Translate)
```
ACTION: Select Hebrew or English text
ACTION: Press Ctrl+Alt+T
EXPECTED: Auto-detects language and translates
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 6.4: Ctrl+Alt+Shift+E (Translate to English)
```
ACTION: Select Hebrew text
ACTION: Press Ctrl+Alt+Shift+E
EXPECTED: Translates to English
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 6.5: Ctrl+Alt+Shift+H (Translate to Hebrew)
```
ACTION: Select English text
ACTION: Press Ctrl+Alt+Shift+H
EXPECTED: Translates to Hebrew
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 6.6: Ctrl+Alt+I (Improve Writing)
```
ACTION: Select any text
ACTION: Press Ctrl+Alt+I
EXPECTED: Improves text (requires API key)
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 6.7: Ctrl+Alt+Space (Floating Menu)
```
ACTION: Press Ctrl+Alt+Space
EXPECTED: Floating menu appears at cursor
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

---

### Category 7: Localization

#### Test 7.1: Hebrew RTL Layout
```
ACTION: Open app (default language is Hebrew)
EXPECTED: All Hebrew text displays RTL:
  - Title right-aligned
  - Buttons right-aligned
  - Text flows right-to-left
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 7.2: Hebrew Interface
```
ACTION: Open Settings
EXPECTED: All labels in Hebrew:
  - "הגדרות כלליות"
  - "ספק תרגום"
  - "פרטיות וביטחון"
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 7.3: Hebrew Error Messages
```
ACTION: Press hotkey without text selected
EXPECTED: Error message in Hebrew:
  - "לא זוהה טקסט מסומן."
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

---

### Category 8: Privacy & Security

#### Test 8.1: API Key Encryption
```
ACTION: Set API key in Settings
ACTION: Close app
ACTION: Open %APPDATA%\LangFlip\settings.json
EXPECTED: API key is encrypted (not readable)
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 8.2: No Text Storage
```
ACTION: Convert/translate multiple texts
ACTION: Check %APPDATA%\LangFlip\ folder
EXPECTED: No text files created
EXPECTED: Only settings.json exists
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 8.3: Clipboard Restoration
```
INPUT: Copy some text to clipboard
ACTION: Select different text
ACTION: Press hotkey
EXPECTED: Clipboard restored to original text
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

#### Test 8.4: Password Field Ignored
```
ACTION: Fill a password field
ACTION: Try to select and process text
EXPECTED: Action refused or ignored
RESULT: ☐ PASS ☐ FAIL
NOTES: _________________________
```

---

### Category 9: Performance

#### Test 9.1: Startup Time
```
ACTION: Run dotnet run
MEASURE: Time to app window visible
EXPECTED: < 3 seconds
RESULT: ☐ PASS ☐ FAIL
TIME: ___________ seconds
```

#### Test 9.2: Keyboard Correction Speed
```
ACTION: Select large text (500 chars)
ACTION: Press Ctrl+Alt+H
MEASURE: Time to conversion
EXPECTED: Instant (< 100ms)
RESULT: ☐ PASS ☐ FAIL
TIME: ___________ ms
```

#### Test 9.3: Translation Speed
```
ACTION: Select text
ACTION: Press Ctrl+Alt+T
MEASURE: Time to result
EXPECTED: 2-5 seconds (depends on API)
RESULT: ☐ PASS ☐ FAIL
TIME: ___________ seconds
```

#### Test 9.4: Memory Usage
```
ACTION: Run app
MEASURE: Memory usage (Task Manager)
EXPECTED: < 200 MB
RESULT: ☐ PASS ☐ FAIL
MEMORY: ___________ MB
```

---

## 📋 **Regression Testing**

After each code change, run these core tests:

- [ ] Keyboard correction still works (Test 1.1, 1.2)
- [ ] Hotkeys still work (Test 6.1-6.7)
- [ ] Settings persist (Test 3.3)
- [ ] No crashes on error (Test 4.4)
- [ ] API key still encrypted (Test 8.1)

---

## 🐛 **Bug Report Template**

```
Title: [Brief description]
Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
Reproducible: ☐ Always ☐ Sometimes ☐ Rarely

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Behavior:
...

Actual Behavior:
...

Environment:
- Windows Version: [10/11]
- .NET Version: [dotnet --version]
- API Provider: [None/OpenAI/etc]

Screenshots/Logs:
[Attach if applicable]
```

---

## ✅ **Sign-Off Checklist**

Before marking build as "Ready for Release":

- [ ] All Category 1 tests pass (Keyboard)
- [ ] All Category 2 tests pass (Translation)
- [ ] All Category 3 tests pass (UI)
- [ ] All Category 4 tests pass (Selection)
- [ ] All Category 5 tests pass (Results)
- [ ] All Category 6 tests pass (Hotkeys)
- [ ] All Category 7 tests pass (Localization)
- [ ] All Category 8 tests pass (Privacy)
- [ ] All Category 9 tests pass (Performance)
- [ ] No critical bugs found
- [ ] No regressions from previous build
- [ ] Documentation updated
- [ ] Release notes prepared

---

Happy testing! 🧪
