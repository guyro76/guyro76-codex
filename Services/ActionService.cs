namespace LangFlipDesktop.Services;

using LangFlipDesktop.Core.Enums;
using LangFlipDesktop.Core.Interfaces;
using LangFlipDesktop.Core.Models;

public class ActionService : IActionService
{
    private readonly IKeyboardLayoutService _keyboardService;
    private readonly IClipboardService _clipboardService;
    private readonly ISettingsService _settingsService;
    private readonly TranslationService _translationService;

    public ActionService(
        IKeyboardLayoutService keyboardService,
        IClipboardService clipboardService,
        ISettingsService settingsService,
        TranslationService translationService)
    {
        _keyboardService = keyboardService;
        _clipboardService = clipboardService;
        _settingsService = settingsService;
        _translationService = translationService;
    }

    public async Task<ActionResult> ExecuteActionAsync(string selectedText, ActionType action)
    {
        if (string.IsNullOrWhiteSpace(selectedText))
        {
            return new ActionResult
            {
                Success = false,
                ErrorMessage = "לא זוהה טקסט מסומן.",
                OriginalText = selectedText,
                ResultDirection = TextDirection.RTL
            };
        }

        try
        {
            var result = action switch
            {
                ActionType.ConvertToHebrew => HandleConvertToHebrew(selectedText),
                ActionType.ConvertToEnglish => HandleConvertToEnglish(selectedText),
                ActionType.TranslateToEnglish => await HandleTranslateToEnglish(selectedText),
                ActionType.TranslateToHebrew => await HandleTranslateToHebrew(selectedText),
                ActionType.ImproveHebrew => await HandleImproveHebrew(selectedText),
                ActionType.ImproveEnglish => await HandleImproveEnglish(selectedText),
                _ => throw new ArgumentException("Unknown action type")
            };

            return result;
        }
        catch (Exception ex)
        {
            return new ActionResult
            {
                Success = false,
                ErrorMessage = ex.Message,
                OriginalText = selectedText,
                ResultDirection = _keyboardService.DetectTextDirection(selectedText)
            };
        }
    }

    private ActionResult HandleConvertToHebrew(string text)
    {
        var converted = _keyboardService.ConvertToHebrew(text);
        return new ActionResult
        {
            Success = true,
            OriginalText = text,
            ResultText = converted,
            ResultDirection = TextDirection.RTL
        };
    }

    private ActionResult HandleConvertToEnglish(string text)
    {
        var converted = _keyboardService.ConvertToEnglish(text);
        return new ActionResult
        {
            Success = true,
            OriginalText = text,
            ResultText = converted,
            ResultDirection = TextDirection.LTR
        };
    }

    private async Task<ActionResult> HandleTranslateToEnglish(string text)
    {
        var translated = await _translationService.TranslateToEnglishAsync(text);
        return new ActionResult
        {
            Success = true,
            OriginalText = text,
            ResultText = translated,
            ResultDirection = TextDirection.LTR
        };
    }

    private async Task<ActionResult> HandleTranslateToHebrew(string text)
    {
        var translated = await _translationService.TranslateToHebrewAsync(text);
        return new ActionResult
        {
            Success = true,
            OriginalText = text,
            ResultText = translated,
            ResultDirection = TextDirection.RTL
        };
    }

    private async Task<ActionResult> HandleImproveHebrew(string text)
    {
        var improved = await _translationService.ImproveHebrewAsync(text);
        return new ActionResult
        {
            Success = true,
            OriginalText = text,
            ResultText = improved,
            ResultDirection = TextDirection.RTL
        };
    }

    private async Task<ActionResult> HandleImproveEnglish(string text)
    {
        var improved = await _translationService.ImproveEnglishAsync(text);
        return new ActionResult
        {
            Success = true,
            OriginalText = text,
            ResultText = improved,
            ResultDirection = TextDirection.LTR
        };
    }
}
