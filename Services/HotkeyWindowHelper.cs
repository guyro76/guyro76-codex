namespace LangFlipDesktop.Services;

using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;

public class HotkeyWindowHelper
{
    private const int WM_HOTKEY = 0x0312;

    private readonly Window _window;
    private HwndSource? _hwndSource;
    private HotkeyManager? _hotkeyManager;

    public HotkeyWindowHelper(Window window)
    {
        _window = window;
    }

    public void SetupHotkeys(HotkeyManager hotkeyManager)
    {
        _hotkeyManager = hotkeyManager;
        _hwndSource = HwndSource.FromHwnd(new WindowInteropHelper(_window).Handle);
        _hwndSource.AddHook(HwndHook);
    }

    public void Cleanup()
    {
        if (_hwndSource != null)
        {
            _hwndSource.RemoveHook(HwndHook);
        }
    }

    private IntPtr HwndHook(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        if (msg == WM_HOTKEY)
        {
            var hotkeyId = wParam.ToInt32();
            _hotkeyManager?.OnHotKeyPressed(hotkeyId);
            handled = true;
        }
        return IntPtr.Zero;
    }
}
