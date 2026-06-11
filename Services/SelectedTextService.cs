namespace LangFlipDesktop.Services;

using System.Windows.Automation;
using System.Windows.Forms;
using System.Windows.Automation.Text;
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
            var element = AutomationElement.FocusedElement;
            if (element == null)
                return false;

            // Try to use ValuePattern to replace directly
            if (element.TryGetCurrentPattern(ValuePattern.Pattern) is ValuePattern valuePattern)
            {
                valuePattern.SetValue(newText);
                return true;
            }

            // Fallback: delete selected text and paste new text
            var savedClipboard = _clipboardService.SaveAndClear();
            _clipboardService.SetClipboardText(newText);
            await Task.Delay(50);

            // Delete selected text (Ctrl+X cuts it)
            SendKey("^x");
            await Task.Delay(50);

            // Paste the new text (Ctrl+V)
            SendKey("^v");
            await Task.Delay(50);

            _clipboardService.Restore(savedClipboard);
            return true;
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
