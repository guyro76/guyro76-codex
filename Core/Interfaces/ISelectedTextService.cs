namespace LangFlipDesktop.Core.Interfaces;

public interface ISelectedTextService
{
    Task<string?> GetSelectedTextAsync();
    Task<bool> ReplaceSelectedTextAsync(string newText);
}
