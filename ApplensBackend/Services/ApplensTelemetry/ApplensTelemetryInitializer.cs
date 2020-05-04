using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.ApplicationInsights.Channel;
using System;

namespace AppLensV3.Services.ApplensTelemetryInitializer
{
    public class ApplensTelemetryInitializer : ITelemetryInitializer
    {
        private static readonly string EnvironmentName;
        private static readonly string WebsiteHostName;

        static ApplensTelemetryInitializer()
        {
            EnvironmentName = Environment.GetEnvironmentVariable("APPLENS_ENVIRONMENT");
            WebsiteHostName = Environment.GetEnvironmentVariable("APPLENS_HOST");
        }

        public void Initialize(ITelemetry telemetry)
        {
            if (!telemetry.Context.GlobalProperties.ContainsKey("environment"))
            {
                telemetry.Context.GlobalProperties.Add("environment", EnvironmentName);
            }

            if (!telemetry.Context.GlobalProperties.ContainsKey("websiteHostName"))
            {
                telemetry.Context.GlobalProperties.Add("websiteHostName", WebsiteHostName);
            }
        }
    }
}