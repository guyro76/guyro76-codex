namespace LangFlipDesktop.Services;

using System.Diagnostics;
using System.Net.Http;
using System.Text.Json;

public interface IUpdateService
{
    Task<(bool UpdateAvailable, string LatestVersion, string DownloadUrl)> CheckForUpdatesAsync();
    Task<bool> DownloadAndInstallUpdateAsync(string downloadUrl);
}

public class UpdateService : IUpdateService
{
    private const string GitHubRepo = "guyro76/guyro76-codex";
    private const string ReleaseApiUrl = $"https://api.github.com/repos/{GitHubRepo}/releases/latest";
    private const string CurrentVersion = "1.0.0";
    private readonly HttpClient _httpClient;

    public UpdateService()
    {
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "LangFlipDesktop");
    }

    public async Task<(bool UpdateAvailable, string LatestVersion, string DownloadUrl)> CheckForUpdatesAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync(ReleaseApiUrl);
            if (!response.IsSuccessStatusCode)
                return (false, CurrentVersion, "");

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var latestVersion = root.GetProperty("tag_name").GetString()?.TrimStart('v') ?? CurrentVersion;

            if (IsNewerVersion(latestVersion, CurrentVersion))
            {
                var assets = root.GetProperty("assets").EnumerateArray();
                var zipAsset = assets.FirstOrDefault(a =>
                    a.GetProperty("name").GetString()?.Contains("win-x64.zip") == true);

                if (zipAsset.ValueKind != JsonValueKind.Undefined)
                {
                    var downloadUrl = zipAsset.GetProperty("browser_download_url").GetString() ?? "";
                    return (true, latestVersion, downloadUrl);
                }
            }

            return (false, latestVersion, "");
        }
        catch
        {
            return (false, CurrentVersion, "");
        }
    }

    public async Task<bool> DownloadAndInstallUpdateAsync(string downloadUrl)
    {
        try
        {
            var tempDir = Path.Combine(Path.GetTempPath(), "LangFlipUpdate");
            if (Directory.Exists(tempDir))
                Directory.Delete(tempDir, true);
            Directory.CreateDirectory(tempDir);

            var zipPath = Path.Combine(tempDir, "LangFlip-Desktop-win-x64.zip");

            // Download
            using var response = await _httpClient.GetAsync(downloadUrl);
            if (!response.IsSuccessStatusCode)
                return false;

            using var fileStream = File.Create(zipPath);
            await response.Content.CopyToAsync(fileStream);

            // Copy installer files
            var installerPath = Path.Combine(tempDir, "Install-LangFlip.bat");
            var psScriptPath = Path.Combine(tempDir, "Install-LangFlip.ps1");

            if (!File.Exists(installerPath) || !File.Exists(psScriptPath))
            {
                // Get installer scripts from resource or create them
                CreateInstallerScripts(tempDir);
            }

            // Run installer with admin
            var startInfo = new ProcessStartInfo
            {
                FileName = installerPath,
                WorkingDirectory = tempDir,
                UseShellExecute = true,
                Verb = "runas"
            };

            var process = Process.Start(startInfo);
            if (process != null)
            {
                process.WaitForExit();
                return process.ExitCode == 0;
            }

            return false;
        }
        catch
        {
            return false;
        }
    }

    private bool IsNewerVersion(string latestVersion, string currentVersion)
    {
        try
        {
            var latest = Version.Parse(latestVersion);
            var current = Version.Parse(currentVersion);
            return latest > current;
        }
        catch
        {
            return false;
        }
    }

    private void CreateInstallerScripts(string tempDir)
    {
        // Get from embedded resources or local installation
        var installBatPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Install-LangFlip.bat");
        var installPsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Install-LangFlip.ps1");

        if (File.Exists(installBatPath))
            File.Copy(installBatPath, Path.Combine(tempDir, "Install-LangFlip.bat"), true);

        if (File.Exists(installPsPath))
            File.Copy(installPsPath, Path.Combine(tempDir, "Install-LangFlip.ps1"), true);
    }
}
