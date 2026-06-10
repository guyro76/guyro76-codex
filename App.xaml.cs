namespace LangFlipDesktop;

using System.Windows;
using LangFlipDesktop.Core.Enums;
using LangFlipDesktop.Core.Interfaces;
using LangFlipDesktop.Services;
using LangFlipDesktop.UI;

public partial class App : Application
{
    private MainWindow? _mainWindow;
    private SettingsWindow? _settingsWindow;
    private FloatingMenu? _floatingMenu;
    private PreviewWindow? _previewWindow;

    private IKeyboardLayoutService? _keyboardService;
    private IClipboardService? _clipboardService;
    private ISettingsService? _settingsService;
    private ISelectedTextService? _selectedTextService;
    private TranslationService? _translationService;
    private IActionService? _actionService;
    private HotkeyManager? _hotkeyManager;
    private HotkeyWindowHelper? _hotkeyWindowHelper;
    private TrayService? _trayService;

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        InitializeServices();
        SetupUI();
        SetupHotkeys();
        SetupTray();
    }

    private void InitializeServices()
    {
        _clipboardService = new ClipboardService();
        _settingsService = new SettingsService();
        _keyboardService = new KeyboardLayoutService();
        _selectedTextService = new SelectedTextService(_clipboardService);
        _translationService = new TranslationService(_settingsService);
        _actionService = new ActionService(_keyboardService, _clipboardService, _settingsService, _translationService);
    }

    private void SetupUI()
    {
        _mainWindow = new MainWindow();
        _mainWindow.ActionRequested += MainWindow_ActionRequested;
        _mainWindow.ShowSettingsRequested += MainWindow_ShowSettingsRequested;
        _mainWindow.Show();
    }

    private void SetupHotkeys()
    {
        _hotkeyManager = new HotkeyManager(new System.Windows.Interop.WindowInteropHelper(_mainWindow!).Handle);
        _hotkeyManager.HotkeyPressed += HotkeyManager_HotkeyPressed;

        _hotkeyWindowHelper = new HotkeyWindowHelper(_mainWindow!);
        _hotkeyWindowHelper.SetupHotkeys(_hotkeyManager);

        _hotkeyManager.RegisterDefaultHotkeys();
    }

    private void SetupTray()
    {
        _trayService = new TrayService();
        _trayService.ActionRequested += TrayService_ActionRequested;
        _trayService.ShowSettings += (s, e) => ShowSettingsWindow();
        _trayService.ShowMainWindow += (s, e) => ShowMainWindow();
        _trayService.Exit += (s, e) => Shutdown();
    }

    private async void MainWindow_ActionRequested(object? sender, ActionType action)
    {
        await ExecuteAction(action);
    }

    private void MainWindow_ShowSettingsRequested(object? sender, EventArgs e)
    {
        ShowSettingsWindow();
    }

    private async void TrayService_ActionRequested(object? sender, ActionType action)
    {
        await ExecuteAction(action);
    }

    private async void HotkeyManager_HotkeyPressed(object? sender, ActionType action)
    {
        await ExecuteAction(action);
    }

    private async Task ExecuteAction(ActionType action)
    {
        try
        {
            if (_selectedTextService == null || _actionService == null)
                return;

            var selectedText = await _selectedTextService.GetSelectedTextAsync();
            if (string.IsNullOrEmpty(selectedText))
            {
                ShowNotification("לא זוהה טקסט מסומן");
                return;
            }

            if (action == ActionType.ImproveEnglish)
            {
                // Show floating menu instead
                ShowFloatingMenu();
                return;
            }

            var result = await _actionService.ExecuteActionAsync(selectedText, action);

            if (!result.Success)
            {
                ShowNotification(result.ErrorMessage ?? "אירעה שגיאה");
                return;
            }

            var resultMode = _settingsService!.GetResultMode();
            if (resultMode == ResultMode.PreviewBeforeReplace)
            {
                ShowPreviewWindow(result);
            }
            else if (resultMode == ResultMode.CopyToClipboard)
            {
                _clipboardService!.CopyToClipboard(result.ResultText);
                ShowNotification("התוצאה הועתקה ללוח");
            }
            else
            {
                // ReplaceInPlace
                await _selectedTextService.ReplaceSelectedTextAsync(result.ResultText);
            }
        }
        catch (Exception ex)
        {
            ShowNotification($"שגיאה: {ex.Message}");
        }
    }

    private void ShowMainWindow()
    {
        if (_mainWindow == null)
        {
            _mainWindow = new MainWindow();
            _mainWindow.Show();
        }
        else if (_mainWindow.WindowState == WindowState.Minimized)
        {
            _mainWindow.WindowState = WindowState.Normal;
        }
        else if (!_mainWindow.IsVisible)
        {
            _mainWindow.Show();
        }
        _mainWindow.Activate();
        _mainWindow.Focus();
    }

    private void ShowSettingsWindow()
    {
        _settingsWindow ??= new SettingsWindow(_settingsService!);
        _settingsWindow.Owner = _mainWindow;
        _settingsWindow.ShowDialog();
    }

    private void ShowFloatingMenu()
    {
        _floatingMenu = new FloatingMenu();
        _floatingMenu.ActionSelected += async (s, action) =>
        {
            await ExecuteAction(action);
        };
        _floatingMenu.ShowAtCursor();
    }

    private void ShowPreviewWindow(Core.Models.ActionResult result)
    {
        _previewWindow = new PreviewWindow(result);
        if (_previewWindow.ShowDialog() == true)
        {
            // User clicked Replace
            _ = _selectedTextService!.ReplaceSelectedTextAsync(result.ResultText);
        }
    }

    private void ShowNotification(string message)
    {
        MessageBox.Show(message, "קליקשפה", MessageBoxButton.OK, MessageBoxImage.Information);
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _hotkeyWindowHelper?.Cleanup();
        _hotkeyManager?.UnregisterAllHotkeys();
        _trayService?.Dispose();
        base.OnExit(e);
    }
}
