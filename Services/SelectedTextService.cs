namespace LangFlipDesktop.Services;

using System.Runtime.InteropServices;
using LangFlipDesktop.Core.Interfaces;

public class SelectedTextService : ISelectedTextService
{
    private readonly IClipboardService _clipboardService;

    // The window that had focus when the hotkey was pressed.
    // Replacement must go back to this window, not to one of our own windows.
    private IntPtr _targetWindow = IntPtr.Zero;

    private const int VK_SHIFT = 0x10;
    private const int VK_CONTROL = 0x11;
    private const int VK_MENU = 0x12; // Alt
    private const byte VK_C = 0x43;
    private const byte VK_V = 0x56;
    private const byte VK_LCONTROL = 0xA2;

    private const uint KEYEVENTF_KEYUP = 0x0002;

    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(int vKey);

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    public SelectedTextService(IClipboardService clipboardService)
    {
        _clipboardService = clipboardService;
    }

    public async Task<string?> GetSelectedTextAsync()
    {
        // Remember the window the user is typing in (Word, WhatsApp, browser...)
        _targetWindow = GetForegroundWindow();

        // Critical: the user is still physically holding Ctrl+Alt from the hotkey.
        // Sending Ctrl+C now would arrive as Ctrl+Alt+C and copy nothing.
        await WaitForModifierReleaseAsync();

        return await TryGetViaClipboardAsync();
    }

    public async Task<bool> ReplaceSelectedTextAsync(string newText)
    {
        try
        {
            // Give focus back to the original window (a dialog of ours may have stolen it)
            if (_targetWindow != IntPtr.Zero)
            {
                SetForegroundWindow(_targetWindow);
                await Task.Delay(150);
            }

            await WaitForModifierReleaseAsync();

            var savedClipboard = _clipboardService.SaveAndClear();
            if (!_clipboardService.SetClipboardText(newText))
                return false;

            await Task.Delay(120);

            // The original selection is still active in the target window,
            // so a single paste replaces it.
            SendCtrlKey(VK_V);

            // Give the target application time to consume the clipboard before restoring it
            await Task.Delay(400);
            _clipboardService.Restore(savedClipboard);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static async Task WaitForModifierReleaseAsync()
    {
        // Wait up to ~1.5s for Ctrl/Alt/Shift to be physically released
        for (var i = 0; i < 50; i++)
        {
            var ctrlDown = (GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0;
            var altDown = (GetAsyncKeyState(VK_MENU) & 0x8000) != 0;
            var shiftDown = (GetAsyncKeyState(VK_SHIFT) & 0x8000) != 0;

            if (!ctrlDown && !altDown && !shiftDown)
                return;

            await Task.Delay(30);
        }
    }

    private async Task<string?> TryGetViaClipboardAsync()
    {
        try
        {
            var previousContent = _clipboardService.SaveAndClear();

            await Task.Delay(80);

            // Applications differ wildly in how fast they service a copy request:
            // Notepad is instant, Word and WhatsApp can take several hundred ms.
            // Poll the clipboard instead of guessing a single delay, and retry the
            // copy itself once in case the first keystroke was swallowed.
            var selectedText = await CopyAndPollClipboardAsync(attempts: 12);

            if (string.IsNullOrEmpty(selectedText))
                selectedText = await CopyAndPollClipboardAsync(attempts: 10);

            _clipboardService.Restore(previousContent);

            return string.IsNullOrEmpty(selectedText) ? null : selectedText;
        }
        catch
        {
            return null;
        }
    }

    private async Task<string?> CopyAndPollClipboardAsync(int attempts)
    {
        SendCtrlKey(VK_C);

        for (var i = 0; i < attempts; i++)
        {
            await Task.Delay(100);

            var text = _clipboardService.GetClipboardText();
            if (!string.IsNullOrEmpty(text))
                return text;
        }

        return null;
    }

    // keybd_event is delivered through the normal input queue, which Word,
    // WhatsApp and Electron apps handle reliably - unlike SendKeys, whose
    // journal hooks are often ignored by these applications.
    private static void SendCtrlKey(byte key)
    {
        try
        {
            keybd_event(VK_LCONTROL, 0, 0, UIntPtr.Zero);
            keybd_event(key, 0, 0, UIntPtr.Zero);
            keybd_event(key, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
            keybd_event(VK_LCONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        }
        catch
        {
            // Silently fail if key sending is not possible
        }
    }
}
