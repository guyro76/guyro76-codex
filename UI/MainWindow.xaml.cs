namespace LangFlipDesktop.UI;

using System.Windows;
using LangFlipDesktop.Core.Enums;
using LangFlipDesktop.Core.Interfaces;

public partial class MainWindow : Window
{
    public event EventHandler<ActionType>? ActionRequested;
    public event EventHandler? ShowSettingsRequested;

    private ISettingsService? _settingsService;

    public MainWindow()
    {
        InitializeComponent();
    }

    public void BindSettings(ISettingsService settingsService)
    {
        _settingsService = settingsService;
        var mode = settingsService.GetResultMode();
        RbReplace.IsChecked = mode == ResultMode.ReplaceInPlace;
        RbPreview.IsChecked = mode == ResultMode.PreviewBeforeReplace;
        RbCopy.IsChecked = mode == ResultMode.CopyToClipboard;
    }

    private void ResultMode_Checked(object sender, RoutedEventArgs e)
    {
        if (_settingsService == null)
            return;

        if (ReferenceEquals(sender, RbReplace))
            _settingsService.SetResultMode(ResultMode.ReplaceInPlace);
        else if (ReferenceEquals(sender, RbPreview))
            _settingsService.SetResultMode(ResultMode.PreviewBeforeReplace);
        else if (ReferenceEquals(sender, RbCopy))
            _settingsService.SetResultMode(ResultMode.CopyToClipboard);

        _settingsService.Save();
    }

    private void Button_AutoFix(object sender, RoutedEventArgs e)
    {
        ActionRequested?.Invoke(this, ActionType.AutoFix);
    }

    private void Button_ConvertHebrew(object sender, RoutedEventArgs e)
    {
        ActionRequested?.Invoke(this, ActionType.ConvertToHebrew);
    }

    private void Button_ConvertEnglish(object sender, RoutedEventArgs e)
    {
        ActionRequested?.Invoke(this, ActionType.ConvertToEnglish);
    }

    private void Button_TranslateEnglish(object sender, RoutedEventArgs e)
    {
        ActionRequested?.Invoke(this, ActionType.TranslateToEnglish);
    }

    private void Button_TranslateHebrew(object sender, RoutedEventArgs e)
    {
        ActionRequested?.Invoke(this, ActionType.TranslateToHebrew);
    }

    private void Button_Improve(object sender, RoutedEventArgs e)
    {
        ActionRequested?.Invoke(this, ActionType.ImproveHebrew);
    }

    private void Button_Settings(object sender, RoutedEventArgs e)
    {
        ShowSettingsRequested?.Invoke(this, EventArgs.Empty);
    }
}
