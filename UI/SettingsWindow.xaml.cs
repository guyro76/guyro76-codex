namespace LangFlipDesktop.UI;

using System.Windows;
using LangFlipDesktop.Core.Interfaces;
using LangFlipDesktop.Services;

public partial class SettingsWindow : Window
{
    private readonly ISettingsService _settingsService;
    private readonly IUpdateService _updateService;

    public SettingsWindow(ISettingsService settingsService, IUpdateService? updateService = null)
    {
        InitializeComponent();
        _settingsService = settingsService;
        _updateService = updateService ?? new UpdateService();
        LoadSettings();
    }

    private void LoadSettings()
    {
        // Load settings from service and populate UI
        // This will be completed when integrated with the main application
    }

    private async void Button_CheckUpdates(object sender, RoutedEventArgs e)
    {
        UpdateStatusText.Text = "בודק עדכונים...";
        var (updateAvailable, latestVersion, downloadUrl) = await _updateService.CheckForUpdatesAsync();

        if (updateAvailable)
        {
            UpdateStatusText.Text = $"עדכון זמין! גרסה {latestVersion}";
            UpdateStatusText.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(79, 255, 0));

            var result = MessageBox.Show(
                $"עדכון חדש זמין: גרסה {latestVersion}\n\nהאם תרצה להתקין עכשיו?",
                "עדכון זמין",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                UpdateStatusText.Text = "מוריד ומתקין...";
                var success = await _updateService.DownloadAndInstallUpdateAsync(downloadUrl);

                if (success)
                {
                    UpdateStatusText.Text = "העדכון הותקן בהצלחה!";
                    MessageBox.Show("האפליקציה תתעדכן בעת ההפעלה הבאה", "עדכון הושלם", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    UpdateStatusText.Text = "שגיאה בהתקנת העדכון";
                }
            }
        }
        else
        {
            UpdateStatusText.Text = "אתה משתמש בגרסה העדכנית";
            UpdateStatusText.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(189, 239, 255));
        }
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
