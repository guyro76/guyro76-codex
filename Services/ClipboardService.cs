namespace LangFlipDesktop.Services;

using System.Windows;
using LangFlipDesktop.Core.Interfaces;

public class ClipboardService : IClipboardService
{
    // The Windows clipboard is a single shared resource - another application
    // holding it open makes any call throw. Every operation retries briefly.
    private const int RetryCount = 6;
    private const int RetryDelayMs = 40;

    public string GetClipboardText()
    {
        for (var i = 0; i < RetryCount; i++)
        {
            try
            {
                return Clipboard.ContainsText() ? Clipboard.GetText() ?? string.Empty : string.Empty;
            }
            catch
            {
                Thread.Sleep(RetryDelayMs);
            }
        }

        return string.Empty;
    }

    public bool SetClipboardText(string text)
    {
        if (string.IsNullOrEmpty(text))
            return false;

        for (var i = 0; i < RetryCount; i++)
        {
            try
            {
                Clipboard.SetText(text);
                return true;
            }
            catch
            {
                Thread.Sleep(RetryDelayMs);
            }
        }

        return false;
    }

    public void CopyToClipboard(string text)
    {
        SetClipboardText(text);
    }

    public string SaveAndClear()
    {
        var current = GetClipboardText();

        for (var i = 0; i < RetryCount; i++)
        {
            try
            {
                Clipboard.Clear();
                break;
            }
            catch
            {
                Thread.Sleep(RetryDelayMs);
            }
        }

        return current;
    }

    public void Restore(string previousContent)
    {
        if (!string.IsNullOrEmpty(previousContent))
        {
            SetClipboardText(previousContent);
        }
    }
}
