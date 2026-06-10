namespace LangFlipDesktop.Services;

using System.Windows.Forms;
using LangFlipDesktop.Core.Enums;

public class TrayService : IDisposable
{
    private readonly NotifyIcon _trayIcon;
    private ContextMenuStrip? _contextMenu;
    private bool _isEnabled = true;

    public event EventHandler<ActionType>? ActionRequested;
    public event EventHandler? ShowSettings;
    public event EventHandler? ShowMainWindow;
    public event EventHandler? Exit;

    public TrayService()
    {
        _trayIcon = new NotifyIcon
        {
            Icon = GetApplicationIcon(),
            Visible = true,
            Text = "קליקשפה - LangFlip Desktop"
        };

        SetupContextMenu();
        _trayIcon.MouseClick += TrayIcon_MouseClick;
    }

    private void SetupContextMenu()
    {
        _contextMenu = new ContextMenuStrip();

        var enableDisableItem = new ToolStripMenuItem("פעיל - Active");
        enableDisableItem.Checked = _isEnabled;
        enableDisableItem.Click += (s, e) => ToggleEnable();
        _contextMenu.Items.Add(enableDisableItem);

        _contextMenu.Items.Add(new ToolStripSeparator());

        var convertHebrewItem = new ToolStripMenuItem("הפוך לעברית");
        convertHebrewItem.Click += (s, e) => ActionRequested?.Invoke(this, ActionType.ConvertToHebrew);
        _contextMenu.Items.Add(convertHebrewItem);

        var convertEnglishItem = new ToolStripMenuItem("הפוך לאנגלית");
        convertEnglishItem.Click += (s, e) => ActionRequested?.Invoke(this, ActionType.ConvertToEnglish);
        _contextMenu.Items.Add(convertEnglishItem);

        var translateEnglishItem = new ToolStripMenuItem("תרגם לאנגלית");
        translateEnglishItem.Click += (s, e) => ActionRequested?.Invoke(this, ActionType.TranslateToEnglish);
        _contextMenu.Items.Add(translateEnglishItem);

        var translateHebrewItem = new ToolStripMenuItem("תרגם לעברית");
        translateHebrewItem.Click += (s, e) => ActionRequested?.Invoke(this, ActionType.TranslateToHebrew);
        _contextMenu.Items.Add(translateHebrewItem);

        var improveHebrewItem = new ToolStripMenuItem("שפר ניסוח בעברית");
        improveHebrewItem.Click += (s, e) => ActionRequested?.Invoke(this, ActionType.ImproveHebrew);
        _contextMenu.Items.Add(improveHebrewItem);

        var improveEnglishItem = new ToolStripMenuItem("Improve English");
        improveEnglishItem.Click += (s, e) => ActionRequested?.Invoke(this, ActionType.ImproveEnglish);
        _contextMenu.Items.Add(improveEnglishItem);

        _contextMenu.Items.Add(new ToolStripSeparator());

        var settingsItem = new ToolStripMenuItem("הגדרות");
        settingsItem.Click += (s, e) => ShowSettings?.Invoke(this, EventArgs.Empty);
        _contextMenu.Items.Add(settingsItem);

        var exitItem = new ToolStripMenuItem("יציאה");
        exitItem.Click += (s, e) => Exit?.Invoke(this, EventArgs.Empty);
        _contextMenu.Items.Add(exitItem);

        _trayIcon.ContextMenuStrip = _contextMenu;
    }

    private void ToggleEnable()
    {
        _isEnabled = !_isEnabled;
        if (_contextMenu?.Items[0] is ToolStripMenuItem item)
        {
            item.Checked = _isEnabled;
            item.Text = _isEnabled ? "פעיל - Active" : "לא פעיל - Inactive";
        }
    }

    private void TrayIcon_MouseClick(object sender, MouseEventArgs e)
    {
        if (e.Button == MouseButtons.Left)
        {
            ShowMainWindow?.Invoke(this, EventArgs.Empty);
        }
    }

    private static System.Drawing.Icon GetApplicationIcon()
    {
        try
        {
            var bitmap = new System.Drawing.Bitmap(16, 16);
            using (var g = System.Drawing.Graphics.FromImage(bitmap))
            {
                g.Clear(System.Drawing.Color.Transparent);
                g.FillEllipse(
                    new System.Drawing.SolidBrush(System.Drawing.Color.FromArgb(255, 0x25, 0x63, 0xEB)),
                    0, 0, 16, 16);
            }
            return System.Drawing.Icon.FromHandle(bitmap.GetHicon());
        }
        catch
        {
            return System.Drawing.SystemIcons.Application;
        }
    }

    public void SetEnabled(bool enabled)
    {
        _isEnabled = enabled;
        if (_contextMenu?.Items[0] is ToolStripMenuItem item)
        {
            item.Checked = enabled;
            item.Text = enabled ? "פעיל - Active" : "לא פעיל - Inactive";
        }
    }

    public bool IsEnabled => _isEnabled;

    public void Dispose()
    {
        _trayIcon.Dispose();
        _contextMenu?.Dispose();
    }
}
