import { Injectable, OnInit, Inject, Input } from '@angular/core';
import { ApplicationInsights, Snippet, IPageViewTelemetry, IEventTelemetry, IExceptionTelemetry, SeverityLevel, ITraceTelemetry, IMetricTelemetry } from '@microsoft/applicationinsights-web'
import { ITelemetryProvider } from './telemetry.common';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../../config/diagnostic-data-config';

@Injectable()
export class AppInsightsTelemetryService implements ITelemetryProvider {

    appInsights: ApplicationInsights;
    constructor(@Inject(DIAGNOSTIC_DATA_CONFIG) private config: DiagnosticDataConfig) {
        const snippet: Snippet = {
            config: {
              instrumentationKey: config.InstrumentationKey,
              disableFetchTracking: false,
              maxAjaxCallsPerView: -1,
              enableAutoRouteTracking: true,
              maxBatchSizeInBytes: 5,
              maxBatchInterval: 1,
            }
          };
          
        this.appInsights = new ApplicationInsights(snippet);
        this.appInsights.loadAppInsights();
    }

    public logPageView(name?: string, url?: string, properties?: any, duration?: number) {  
        properties = properties || {};
        properties.duration = duration === undefined || duration === null ? 0 : duration;

        const pageViewTelemetry: IPageViewTelemetry = {
            name: name,
            uri: url,
            properties: properties,
          };
        this.appInsights .trackPageView(pageViewTelemetry);
    }

    public logEvent(message?: string, properties?: any, measurements?: any) {
        const mergedProperties = {...properties, ... measurements};
        const eventTelemetry: IEventTelemetry = {
            name: message,
            properties: mergedProperties
        };
        
        if (this.appInsights) {
            this.appInsights.trackEvent(eventTelemetry);
        }
    }

    public logException(exception: Error, handledAt?: string, properties?: any, severityLevel?: SeverityLevel) {
        const mergedProperties = { handledAt: handledAt, ...properties};
        const exceptionTelemetry = { exception, severityLevel, mergedProperties } as IExceptionTelemetry;


        if (this.appInsights) {
        this.appInsights.trackException(exceptionTelemetry);
        }
    }

    public logTrace(message: string, properties?: any, severityLevel?: SeverityLevel) {
        severityLevel = severityLevel == undefined || severityLevel == null ? SeverityLevel.Information : severityLevel;
        const traceTelemetry = { message, severityLevel: severityLevel,  properties: properties} as ITraceTelemetry;

        if (this.appInsights) {
            this.appInsights.trackTrace(traceTelemetry);
        }
    }

    public logMetric(name: string, average: number, sampleCount?: number, min?: number, max?: number, properties?: any) {
        const metricTelemetry = { name, average, sampleCount, min, max, properties} as IMetricTelemetry;
        if (this.appInsights) {
            this.appInsights.trackMetric(metricTelemetry);
        } 
    }

    public flush() {
        if (this.appInsights) {
            this.appInsights.flush();
        }
    }
}
