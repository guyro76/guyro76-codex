namespace LangFlipDesktop.Core.Interfaces;

using LangFlipDesktop.Core.Enums;
using LangFlipDesktop.Core.Models;

public interface IActionService
{
    Task<ActionResult> ExecuteActionAsync(string selectedText, ActionType action);
}
