# Microsoft IIS (Internet Information Services)

IIS is a web server developed by Microsoft for Windows Server. It is tightly integrated with the Windows operating system and the .NET ecosystem, making it the standard choice for hosting ASP.NET applications, Windows-based web services, and enterprise intranet sites.

## Core Architecture

IIS uses a modular, request-processing pipeline:

- **HTTP.sys** — A kernel-mode HTTP listener that handles incoming requests before they reach user mode.
- **W3SVC (World Wide Web Publishing Service)** — Manages worker processes and configuration.
- **WAS (Windows Process Activation Service)** — Manages application pool lifecycle and non-HTTP protocols.
- **Worker Process (w3wp.exe)** — Handles request processing within an application pool.

```
Client → HTTP.sys (kernel) → W3SVC → Application Pool (w3wp.exe) → Application
```

## Application Pools

Application pools isolate web applications for reliability and security. Each pool runs one or more worker processes.

Key settings:

- **Identity** — The Windows account the worker process runs under (ApplicationPoolIdentity, NetworkService, or a custom account).
- **Pipeline Mode** — Integrated (recommended) or Classic.
- **CLR Version** — .NET version for the pool (v4.0 or No Managed Code).
- **Recycling** — Periodic restart of worker processes to prevent memory leaks.

```powershell
# Create an application pool via PowerShell
Import-Module WebAdministration

New-WebAppPool -Name "MyAppPool"
Set-ItemProperty "IIS:\AppPools\MyAppPool" -Name "managedRuntimeVersion" -Value "v4.0"
Set-ItemProperty "IIS:\AppPools\MyAppPool" -Name "managedPipelineMode" -Value "Integrated"
Set-ItemProperty "IIS:\AppPools\MyAppPool" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"

# Set recycling schedule
Set-ItemProperty "IIS:\AppPools\MyAppPool" -Name "recycling.periodicRestart.time" -Value "00:00:00"
Set-ItemProperty "IIS:\AppPools\MyAppPool" -Name "recycling.periodicRestart.privateMemory" -Value 1048576
```

## web.config

`web.config` is the primary configuration file for IIS applications. It is an XML file placed in the application root directory.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <!-- Default document -->
    <defaultDocument>
      <files>
        <add value="index.html" />
      </files>
    </defaultDocument>

    <!-- URL Rewrite -->
    <rewrite>
      <rules>
        <!-- Redirect HTTP to HTTPS -->
        <rule name="HTTPS Redirect" stopProcessing="true">
          <match url="(.*)" />
          <conditions>
            <add input="{HTTPS}" pattern="off" />
          </conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
        </rule>

        <!-- SPA routing — send all routes to index.html -->
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>

    <!-- Custom error pages -->
    <httpErrors errorMode="Custom">
      <remove statusCode="404" />
      <error statusCode="404" path="/errors/404.html" responseMode="ExecuteURL" />
    </httpErrors>

    <!-- Security headers -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <remove name="X-Powered-By" />
      </customHeaders>
    </httpProtocol>

    <!-- Static content caching -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="30.00:00:00" />
    </staticContent>
  </system.webServer>
</configuration>
```

## ASP.NET Integration

IIS is the primary host for ASP.NET applications. Modern ASP.NET Core apps run with the ASP.NET Core Module.

```xml
<!-- web.config for ASP.NET Core -->
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" />
      </handlers>
      <aspNetCore processPath="dotnet"
                  arguments=".\MyApp.dll"
                  stdoutLogEnabled="true"
                  stdoutLogFile=".\logs\stdout"
                  hostingModel="InProcess">
        <environmentVariables>
          <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
        </environmentVariables>
      </aspNetCore>
    </system.webServer>
  </location>
</configuration>
```

Hosting models:

- **InProcess** — The app runs inside the IIS worker process (w3wp.exe). Best performance.
- **OutOfProcess** — IIS proxies requests to a separate Kestrel process.

## IIS Management via PowerShell

```powershell
# Create a new website
New-Website -Name "MyWebsite" `
  -PhysicalPath "C:\inetpub\mysite" `
  -Port 443 -Ssl `
  -ApplicationPool "MyAppPool"

# Bind an SSL certificate
New-WebBinding -Name "MyWebsite" -Protocol "https" -Port 443 -HostHeader "example.com"
$cert = Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object { $_.Subject -like "*example.com*" }
$binding = Get-WebBinding -Name "MyWebsite" -Protocol "https"
$binding.AddSslCertificate($cert.Thumbprint, "My")

# Start and stop
Start-Website -Name "MyWebsite"
Stop-Website -Name "MyWebsite"

# List all sites
Get-Website
```

## Resources

- [IIS Official Documentation](https://docs.microsoft.com/en-us/iis/)
- [ASP.NET Core on IIS](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/)
- [IIS URL Rewrite Module](https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/)
- [IIS Administration via PowerShell](https://docs.microsoft.com/en-us/powershell/module/webadministration/)
