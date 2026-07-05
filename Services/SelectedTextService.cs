namespace LangFlipDesktop.Services;

using System.Runtime.InteropServices;
using System.Windows.Forms;
using LangFlipDesktop.Core.Interfaces;

public class SelectedTextService : ISelectedTextService
{
    private readonly IClipboardService _clipboardService;

    // The window that had focus when the hotkey was pressed.
    // Replacement must go back to this window, not to our own preview dialog.
    private IntPtr _targetWindow = IntPtr.Zero;

    private const int VK_SHIFT = 0x10;
    private const int VK_CONTROL = 0x11;
    private const int VK_MENU = 0x12; // Alt

    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(int vKey);

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern bool SetForegroundWindow(IntPtr hWnd);

    public SelectedTextService(IClipboardService clipboardService)
    {
        _clipboardService = clipboardService;
    }

    public async Task<string?> GetSelectedTextAsync()
    {
        // Remember the window the user is typing in (Word, Notepad, browser...)
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
            // Give focus back to the original window (the preview dialog may have stolen it)
            if (_targetWindow != IntPtr.Zero)
            {
                SetForegroundWindow(_targetWindow);
                await Task.Delay(150);
            }

            await WaitForModifierReleaseAsync();

            var savedClipboard = _clipboardService.SaveAndClear();
            _clipboardService.SetClipboardText(newText);
            await Task.Delay(100);

            // The original selection is still active in the target window,
            // so a single paste replaces it.
            SendKey("^v");

            // Give the target application time to consume the clipboard before restoring it
            await Task.Delay(300);
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

            await Task.Delay(100);

            // Simulate Ctrl+C to copy the current selection
            SendKey("^c");

            await Task.Delay(150);

            var selectedText = _clipboardService.GetClipboardText();

            _clipboardService.Restore(previousContent);

            return string.IsNullOrEmpty(selectedText) ? null : selectedText;
        }
        catch
        {
            return null;
        }
    }

    private void SendKey(string keys)
    {
        try
        {
            SendKeys.SendWait(keys);
        }
        catch
        {
            // Silently fail if key sending is not possible
        }
    }
}
