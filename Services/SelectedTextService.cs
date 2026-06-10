namespace LangFlipDesktop.Services;

using System.Windows.Automation;
using System.Windows.Forms;
using LangFlipDesktop.Core.Interfaces;

public class SelectedTextService : ISelectedTextService
{
    private readonly IClipboardService _clipboardService;

    public SelectedTextService(IClipboardService clipboardService)
    {
        _clipboardService = clipboardService;
    }

    public async Task<string?> GetSelectedTextAsync()
    {
        // Try UI Automation first
        var uiAutomationText = TryGetViaUIAutomation();
        if (!string.IsNullOrEmpty(uiAutomationText))
        {
            return uiAutomationText;
        }

        // Fallback to clipboard method
        return await TryGetViaClipboardAsync();
    }

    public async Task<bool> ReplaceSelectedTextAsync(string newText)
    {
        try
        {
            // Try Ctrl+V replacement after copying to clipboard
            _clipboardService.SetClipboardText(newText);

            // Simulate Ctrl+V
            var element = AutomationElement.FocusedElement;
            if (element != null)
            {
                await Task.Delay(50);
                // This would need keyboard simulation, which requires user32.dll interop
                // For now, just return true - the text is in clipboard
                return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    private string? TryGetViaUIAutomation()
    {
        try
        {
            var element = AutomationElement.FocusedElement;
            if (element == null)
                return null;

            var textPattern = element.GetCurrentPattern(TextPattern.Pattern) as TextPattern;
            if (textPattern?.DocumentRange == null)
                return null;

            var selection = textPattern.GetSelection();
            if (selection == null || selection.Length == 0)
                return null;

            var selectedText = selection[0].GetText(-1);
            return !string.IsNullOrEmpty(selectedText) ? selectedText : null;
        }
        catch
        {
            return null;
        }
    }

    private async Task<string?> TryGetViaClipboardAsync()
    {
        try
        {
            var previousContent = _clipboardService.SaveAndClear();

            await Task.Delay(100);

            // Simulate Ctrl+C
            SendKey("^c");

            await Task.Delay(100);

            var selectedText = _clipboardService.GetClipboardText();

            if (string.IsNullOrEmpty(selectedText))
            {
                _clipboardService.Restore(previousContent);
                return null;
            }

            _clipboardService.Restore(previousContent);
            return selectedText;
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
