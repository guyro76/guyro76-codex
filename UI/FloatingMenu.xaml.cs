namespace LangFlipDesktop.UI;

using System.Windows;
using System.Windows.Input;
using LangFlipDesktop.Core.Enums;

public partial class FloatingMenu : Window
{
    public event EventHandler<ActionType>? ActionSelected;

    public FloatingMenu()
    {
        InitializeComponent();

        KeyDown += FloatingMenu_KeyDown;
        Deactivated += FloatingMenu_Deactivated;
    }

    public void ShowAtCursor()
    {
        var position = Mouse.GetPosition(null);
        Left = position.X - Width / 2;
        Top = position.Y - Height / 2;

        Show();
        Activate();
    }

    private void FloatingMenu_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Escape)
        {
            Close();
            e.Handled = true;
        }
    }

    private void FloatingMenu_Deactivated(object sender, EventArgs e)
    {
        Close();
    }

    private void Button_ConvertHebrew(object sender, RoutedEventArgs e)
    {
        ActionSelected?.Invoke(this, ActionType.ConvertToHebrew);
        Close();
    }

    private void Button_ConvertEnglish(object sender, RoutedEventArgs e)
    {
        ActionSelected?.Invoke(this, ActionType.ConvertToEnglish);
        Close();
    }

    private void Button_TranslateEnglish(object sender, RoutedEventArgs e)
    {
        ActionSelected?.Invoke(this, ActionType.TranslateToEnglish);
        Close();
    }

    private void Button_TranslateHebrew(object sender, RoutedEventArgs e)
    {
        ActionSelected?.Invoke(this, ActionType.TranslateToHebrew);
        Close();
    }

    private void Button_ImproveHebrew(object sender, RoutedEventArgs e)
    {
        ActionSelected?.Invoke(this, ActionType.ImproveHebrew);
        Close();
    }

    private void Button_ImproveEnglish(object sender, RoutedEventArgs e)
    {
        ActionSelected?.Invoke(this, ActionType.ImproveEnglish);
        Close();
    }
}
