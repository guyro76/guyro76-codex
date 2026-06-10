namespace LangFlipDesktop.UI;

using System.Windows;
using LangFlipDesktop.Core.Interfaces;

public partial class SettingsWindow : Window
{
    private readonly ISettingsService _settingsService;

    public SettingsWindow(ISettingsService settingsService)
    {
        InitializeComponent();
        _settingsService = settingsService;
        LoadSettings();
    }

    private void LoadSettings()
    {
        // Load settings from service and populate UI
        // This will be completed when integrated with the main application
    }

    private void Button_Save(object sender, RoutedEventArgs e)
    {
        // Save settings to service
        _settingsService.Save();
        DialogResult = true;
        Close();
    }

    private void Button_Cancel(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }
}
