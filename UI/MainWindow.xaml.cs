namespace LangFlipDesktop.UI;

using System.Windows;
using LangFlipDesktop.Core.Enums;

public partial class MainWindow : Window
{
    public event EventHandler<ActionType>? ActionRequested;
    public event EventHandler? ShowSettingsRequested;

    public MainWindow()
    {
        InitializeComponent();
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
