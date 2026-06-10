namespace LangFlipDesktop.Core.Interfaces;

using LangFlipDesktop.Core.Models;

public interface IKeyboardLayoutService
{
    string ConvertToHebrew(string text);
    string ConvertToEnglish(string text);
    TextDirection DetectTextDirection(string text);
}
