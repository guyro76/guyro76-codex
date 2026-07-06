namespace LangFlipDesktop.UI;

using System.Windows;
using System.Windows.Media.Animation;
using System.Windows.Threading;

public partial class ToastWindow : Window
{
    private static ToastWindow? _current;
    private readonly DispatcherTimer _closeTimer;

    public ToastWindow(string message)
    {
        InitializeComponent();
        MessageText.Text = message;

        _closeTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(2.5) };
        _closeTimer.Tick += (s, e) => FadeOutAndClose();
    }

    public static void ShowMessage(string message)
    {
        // Only one toast at a time - replace the previous one
        _current?.Close();

        var toast = new ToastWindow(message);
        _current = toast;
        toast.Show();
        toast.PositionBottomCenter();
        toast.FadeIn();
        toast._closeTimer.Start();
    }

    private void PositionBottomCenter()
    {
        var workArea = SystemParameters.WorkArea;
        Left = workArea.Left + (workArea.Width - ActualWidth) / 2;
        Top = workArea.Bottom - ActualHeight - 60;
    }

    private void FadeIn()
    {
        Opacity = 0;
        var animation = new DoubleAnimation(0, 1, TimeSpan.FromMilliseconds(180));
        BeginAnimation(OpacityProperty, animation);
    }

    private void FadeOutAndClose()
    {
        _closeTimer.Stop();
        var animation = new DoubleAnimation(1, 0, TimeSpan.FromMilliseconds(250));
        animation.Completed += (s, e) =>
        {
            if (ReferenceEquals(_current, this))
                _current = null;
            Close();
        };
        BeginAnimation(OpacityProperty, animation);
    }
}
