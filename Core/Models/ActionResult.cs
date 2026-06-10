namespace LangFlipDesktop.Core.Models;

public class ActionResult
{
    public bool Success { get; set; }
    public string ResultText { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public string OriginalText { get; set; } = string.Empty;
    public TextDirection ResultDirection { get; set; }
}
