using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.ApplicationInsights.Channel;
using System;

namespace Backend.Services
{
    public class AppInsightsTelemetryInitializer : ITelemetryInitializer
    {
        private static readonly string EnvironmentName;
        private static readonly string WebsiteHostName;

        static AppInsightsTelemetryInitializer()
        {
            EnvironmentName = Environment.GetEnvironmentVariable("ADS_ENVIRONMENT");
            WebsiteHostName = Environment.GetEnvironmentVariable("ADS_HOST");
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