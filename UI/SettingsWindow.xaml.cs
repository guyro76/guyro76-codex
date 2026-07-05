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
        var mode = _settingsService.GetResultMode();
        SrbReplace.IsChecked = mode == Core.Enums.ResultMode.ReplaceInPlace;
        SrbPreview.IsChecked = mode == Core.Enums.ResultMode.PreviewBeforeReplace;
        SrbCopy.IsChecked = mode == Core.Enums.ResultMode.CopyToClipboard;

        RestoreClipboardCheck.IsChecked = _settingsService.GetRestoreClipboard();

        ProviderCombo.SelectedIndex = _settingsService.GetTranslationProvider() switch
        {
            Core.Enums.TranslationProvider.OpenAI => 1,
            Core.Enums.TranslationProvider.DeepL => 2,
            _ => 0 // Local (free)
        };

        ApiKeyBox.Password = _settingsService.GetTranslationApiKey();
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
        if (SrbReplace.IsChecked == true)
            _settingsService.SetResultMode(Core.Enums.ResultMode.ReplaceInPlace);
        else if (SrbPreview.IsChecked == true)
            _settingsService.SetResultMode(Core.Enums.ResultMode.PreviewBeforeReplace);
        else if (SrbCopy.IsChecked == true)
            _settingsService.SetResultMode(Core.Enums.ResultMode.CopyToClipboard);

        _settingsService.SetRestoreClipboard(RestoreClipboardCheck.IsChecked == true);

        _settingsService.SetTranslationProvider(ProviderCombo.SelectedIndex switch
        {
            1 => Core.Enums.TranslationProvider.OpenAI,
            2 => Core.Enums.TranslationProvider.DeepL,
            _ => Core.Enums.TranslationProvider.None // Local (free)
        });

        _settingsService.SetTranslationApiKey(ApiKeyBox.Password ?? "");

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
