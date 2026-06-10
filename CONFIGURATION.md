# LangFlip Desktop — Configuration Guide

Complete guide to configuring LangFlip Desktop for different scenarios.

---

## 📁 **Settings File Location**

```
Windows: %APPDATA%\LangFlip\settings.json
```

Example full path:
```
C:\Users\YourUsername\AppData\Roaming\LangFlip\settings.json
```

---

## 🔧 **Default Settings**

When you first run the app, a `settings.json` file is created with defaults:

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

## ⚙️ **Configuration Options**

### Result Mode
Controls what happens after an action completes.

| Option | Behavior |
|--------|----------|
| `PreviewBeforeReplace` | Show preview window, ask to confirm |
| `ReplaceInPlace` | Automatically replace selected text |
| `CopyToClipboard` | Copy result to clipboard (no replacement) |

```json
{
  "resultMode": "PreviewBeforeReplace"
}
```

### Restore Clipboard
Whether to restore previous clipboard content after an action.

```json
{
  "restoreClipboard": true  // Keep previous clipboard content
}
```

**Scenarios**:
- `true`: Good if you're working with other content on clipboard
- `false`: Faster, but may lose clipboard data

### Translation Provider
Which AI provider to use for translation and writing improvement.

```json
{
  "translationProvider": "None"  // Options: None, OpenAI, DeepL, GoogleCloud
}
```

**Available Providers**:
- `None`: Keyboard correction only (works offline)
- `OpenAI`: Chat GPT-4 or GPT-3.5-turbo
- `DeepL`: High-quality translation (v1.5+)
- `GoogleCloud`: Google Cloud Translation API (v2.0+)

### Translation API Key
Your API key for the selected provider. **Encrypted with AES-256**.

```json
{
  "translationApiKey": "[encrypted_key_here]"
}
```

**To set via UI**:
1. Open Settings window
2. Select provider
3. Enter API key
4. Click "Test Connection"
5. Click Save

### Disable Text Storage
Whether to prevent the app from storing any text data.

```json
{
  "disableTextStorage": true  // Recommended for privacy
}
```

**v1.0 behavior**: Always `true` (no storage by default)  
**v1.5+**: Will add optional history when toggled to `false`

### Ignore Password Fields
Whether to skip text selection in password fields.

```json
{
  "ignorePasswordFields": true  // Recommended for security
}
```

**Behavior**:
- `true`: Refuses to process text from password inputs
- `false`: Allows processing (security risk)

### Interface Language
Language for the UI.

```json
{
  "interfaceLanguage": "he"  // Options: he, en
}
```

**Supported**:
- `he`: Hebrew (RTL interface)
- `en`: English (LTR interface)

### Start With Windows
Whether to launch the app when Windows starts.

```json
{
  "startWithWindows": false
}
```

**When enabled**:
- Shortcut created in Windows Startup folder
- App launches minimized in system tray
- User doesn't see main window immediately

### Run In Background
Whether to minimize to tray instead of taskbar.

```json
{
  "runInBackground": true
}
```

**Behavior**:
- `true`: Main window hidden, icon in system tray
- `false`: App visible in taskbar

### Theme
Visual theme selection.

```json
{
  "theme": "GlassDark"  // Options: GlassDark, GlassLight
}
```

**Available**:
- `GlassDark`: Dark glassmorphism (default, current)
- `GlassLight`: Light glassmorphism (v1.5+)

### Reduced Motion
Whether to disable animations for accessibility.

```json
{
  "reducedMotion": false
}
```

**When enabled**:
- Floating menu appears instantly (no fade)
- Preview window no scale animation
- Buttons no hover effects
- Good for accessibility

---

## 🚀 **Configuration Scenarios**

### Scenario 1: Privacy-First (Offline Only)
```json
{
  "translationProvider": "None",
  "disableTextStorage": true,
  "ignorePasswordFields": true,
  "resultMode": "PreviewBeforeReplace"
}
```

**Features**:
- Keyboard correction only (offline)
- No translation (requires API key)
- Maximum privacy

### Scenario 2: Power User with Translation
```json
{
  "translationProvider": "OpenAI",
  "translationApiKey": "sk-...",
  "resultMode": "ReplaceInPlace",
  "restoreClipboard": true,
  "runInBackground": true,
  "startWithWindows": true
}
```

**Features**:
- Full translation + improvement
- Auto-replace selected text
- Runs at startup
- Always in background

### Scenario 3: Office/Professional
```json
{
  "translationProvider": "OpenAI",
  "resultMode": "PreviewBeforeReplace",
  "disableTextStorage": true,
  "ignorePasswordFields": true,
  "theme": "GlassDark",
  "runInBackground": false
}
```

**Features**:
- Translation enabled
- Preview before action
- Security: Ignore password fields
- Visible in taskbar

### Scenario 4: Accessibility Mode
```json
{
  "reducedMotion": true,
  "resultMode": "PreviewBeforeReplace",
  "interfaceLanguage": "he",
  "ignorePasswordFields": true
}
```

**Features**:
- No animations
- Preview for every action
- Clear confirmation before changes
- Safe for sensitive data

---

## 🔐 **API Key Configuration**

### OpenAI Setup

1. **Get API Key**:
   - Visit: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Add to Settings**:
   - Run LangFlip Desktop
   - Click Settings button
   - Provider: Select "OpenAI"
   - API Key: Paste your key
   - Click "Test Connection" (should show ✓)
   - Click Save

3. **Verify**:
   - Select some text
   - Press Ctrl+Alt+T (translate)
   - Should work without errors

### OpenAI Cost Estimation

Pricing (as of 2024):
- GPT-3.5-turbo: ~$0.0005 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens

**Typical usage**:
- 100 translations/day ≈ $1-5/month
- 1000 translations/day ≈ $10-50/month

Set usage limits in OpenAI dashboard to avoid surprises.

---

## 📋 **Manual Configuration (Advanced)**

Edit settings.json directly (power users):

1. **Locate file**:
   ```
   C:\Users\YourUsername\AppData\Roaming\LangFlip\settings.json
   ```

2. **Open in text editor**:
   - Notepad, VS Code, etc.

3. **Edit settings** (JSON format):
   ```json
   {
     "resultMode": "ReplaceInPlace",
     "translationProvider": "OpenAI"
   }
   ```

4. **Save and close**

5. **Restart the app** to apply changes

### Caution
- Keep valid JSON format
- API keys are encrypted (don't edit directly)
- Invalid JSON will prevent app startup

---

## 🔄 **Backup & Migrate Settings**

### Backup Settings
```bash
# Copy the settings file
Copy-Item "$env:APPDATA\LangFlip\settings.json" "C:\Backup\langflip-settings.json"
```

### Migrate to Another Machine
1. Backup settings on old machine
2. Install app on new machine
3. Run app once (creates default settings)
4. Stop the app
5. Copy backed-up settings.json to: `%APPDATA%\LangFlip\`
6. Restart app

Note: API keys are encrypted, migration may fail. Re-enter API keys if needed.

---

## 🆘 **Troubleshooting Configuration**

### Settings Not Saving
**Problem**: Changes in settings window don't persist  
**Solution**:
- Make sure you click "Save" button
- Check that `%APPDATA%\LangFlip\` folder exists
- Try running as Administrator

### API Key Not Working
**Problem**: Translation fails with "Invalid API Key"  
**Solution**:
- Verify key is correct (no extra spaces)
- Check key isn't revoked in OpenAI dashboard
- Try "Test Connection" in Settings
- Check internet connection
- Try with a shorter text (token limits)

### App Won't Start
**Problem**: settings.json corruption  
**Solution**:
- Delete `%APPDATA%\LangFlip\settings.json`
- Restart app (creates fresh settings)
- Reconfigure as needed

### Wrong Language
**Problem**: UI shows wrong language  
**Solution**:
- Settings → Language
- Select correct language
- Restart app

---

## 📞 **Getting Help**

- **Settings not showing expected behavior?**
  - Check README.md for feature documentation
  - Check that you clicked "Save" in settings window

- **API key issues?**
  - Verify key is valid (test in dashboard)
  - Check account has credits
  - Try different text (may be token limit)

- **Want to contribute?**
  - Read DEVELOPMENT_GUIDE.md
  - Suggest improvements in documentation

---

## 🎯 **Next Steps**

1. **Try different result modes** to find what works for you
2. **Configure API key** if you want translation
3. **Enable privacy options** for sensitive data
4. **Set up auto-startup** if you use the app daily
5. **Backup settings.json** in case you need to restore

Happy configuring! 🚀
