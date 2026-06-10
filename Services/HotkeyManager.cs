namespace LangFlipDesktop.Services;

using System.Runtime.InteropServices;
using LangFlipDesktop.Core.Enums;

public class HotkeyManager
{
    [DllImport("user32.dll")]
    private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

    [DllImport("user32.dll")]
    private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

    private const uint MOD_CTRL = 2;
    private const uint MOD_ALT = 1;
    private const uint MOD_SHIFT = 4;

    private const uint VK_H = 0x48;
    private const uint VK_E = 0x45;
    private const uint VK_T = 0x54;
    private const uint VK_I = 0x49;
    private const uint VK_SPACE = 0x20;

    private readonly IntPtr _windowHandle;
    private readonly Dictionary<int, ActionType> _registeredHotkeys = new();
    private int _hotkeyIdCounter = 1;

    public event EventHandler<ActionType>? HotkeyPressed;

    public HotkeyManager(IntPtr windowHandle)
    {
        _windowHandle = windowHandle;
    }

    public void RegisterDefaultHotkeys()
    {
        RegisterHotkey(MOD_CTRL | MOD_ALT, VK_H, ActionType.ConvertToHebrew);      // Ctrl+Alt+H
        RegisterHotkey(MOD_CTRL | MOD_ALT, VK_E, ActionType.ConvertToEnglish);      // Ctrl+Alt+E
        RegisterHotkey(MOD_CTRL | MOD_ALT, VK_T, ActionType.TranslateToHebrew);     // Ctrl+Alt+T (auto-detect)
        RegisterHotkey(MOD_CTRL | MOD_ALT | MOD_SHIFT, VK_E, ActionType.TranslateToEnglish);   // Ctrl+Alt+Shift+E
        RegisterHotkey(MOD_CTRL | MOD_ALT | MOD_SHIFT, VK_H, ActionType.TranslateToHebrew);    // Ctrl+Alt+Shift+H
        RegisterHotkey(MOD_CTRL | MOD_ALT, VK_I, ActionType.ImproveEnglish);        // Ctrl+Alt+I
        RegisterHotkey(MOD_CTRL | MOD_ALT, VK_SPACE, ActionType.ImproveEnglish);    // Ctrl+Alt+Space (floating menu)
    }

    public void UnregisterAllHotkeys()
    {
        foreach (var hotkeyId in _registeredHotkeys.Keys)
        {
            UnregisterHotKey(_windowHandle, hotkeyId);
        }
        _registeredHotkeys.Clear();
    }

    public void OnHotKeyPressed(int hotkeyId)
    {
        if (_registeredHotkeys.TryGetValue(hotkeyId, out var actionType))
        {
            HotkeyPressed?.Invoke(this, actionType);
        }
    }

    private void RegisterHotkey(uint modifiers, uint key, ActionType actionType)
    {
        var id = _hotkeyIdCounter++;
        if (RegisterHotKey(_windowHandle, id, modifiers, key))
        {
            _registeredHotkeys[id] = actionType;
        }
    }
}
