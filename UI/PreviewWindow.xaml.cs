namespace LangFlipDesktop.UI;

using System.Windows;
using LangFlipDesktop.Core.Models;

public partial class PreviewWindow : Window
{
    private ActionResult _actionResult;

    public PreviewWindow(ActionResult result)
    {
        InitializeComponent();
        _actionResult = result;
        DisplayPreview();
    }

    private void DisplayPreview()
    {
        OriginalTextBox.Text = _actionResult.OriginalText;
        ResultTextBox.Text = _actionResult.ResultText;

        // Set flow direction based on text direction
        if (_actionResult.ResultDirection == TextDirection.RTL)
        {
            ResultTextBox.FlowDirection = FlowDirection.RightToLeft;
        }
        else
        {
            ResultTextBox.FlowDirection = FlowDirection.LeftToRight;
        }
    }

    private void Button_Replace(object sender, RoutedEventArgs e)
    {
        DialogResult = true;
        Close();
    }

    private void Button_Copy(object sender, RoutedEventArgs e)
    {
        try
        {
            System.Windows.Forms.Clipboard.SetText(_actionResult.ResultText);
            MessageBox.Show("התוצאה הועתקה ללוח הזכרון", "קליקשפה", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        catch
        {
            MessageBox.Show("לא הצלחתי להעתיק ללוח הזכרון", "שגיאה", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void Button_Cancel(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }
}
