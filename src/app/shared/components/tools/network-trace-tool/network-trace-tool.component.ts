import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SiteService } from '../../../services/site.service';
import { WindowService } from '../../../services/window.service';
import { AvailabilityLoggingService } from '../../../services/logging/availability.logging.service';
import { StepWizardSingleStep } from '../../../models/step-wizard-single-step';
import { SiteInfoMetaData } from '../../../models/site';
import { ServerFarmDataService } from '../../../services/server-farm-data.service';
import { UriElementsService } from '../../../services/urielements.service';
import { Observable } from 'rxjs/Observable';
import { ArmService } from '../../../services/arm.service';
import { NetworkTraceResult } from '../../../models/network-trace';

@Component({
    templateUrl: 'network-trace-tool.component.html',
    styleUrls: ['../styles/daasstyles.css']
})
export class NetworkTraceToolComponent implements OnInit {

    title: string = "Collect a Network Trace";
    description: string = "If your app is facing issues while connecting to a remote server, you can use this tool to collect a network trace on the instance(s) serving the Web App.";
    scmPath: string;
    duration: number = 60;
    supportedTier: boolean = false;
    checkingValidity: boolean = true;
    inProgress: boolean = false;
    siteToBeDiagnosed: SiteInfoMetaData;
    networkTraceStarted: boolean = false;
    error: any;
    files: string[] = [];
    alreadyRunning: boolean = false;
    localCacheEnabled: boolean = false;
    traceLocation: string = "d:\\home\\logfiles\\networktrace";

    constructor(private _siteService: SiteService, private _uriElementsService: UriElementsService, private _armClient: ArmService, private _serverFarmService: ServerFarmDataService, private _windowServiceLocal: WindowService, private _loggerLocal: AvailabilityLoggingService) {

        this._siteService.currentSiteMetaData.subscribe(siteInfo => {
            if (siteInfo) {
                this.siteToBeDiagnosed = siteInfo;
            }
        });
    }
    ngOnInit(): void {
        this.scmPath = this._siteService.currentSiteStatic.enabledHostNames.find(hostname => hostname.indexOf('.scm.') > 0);

        this._serverFarmService.siteServerFarm.subscribe(serverFarm => {
            if (serverFarm) {
                // Specifically not checking for Isolated as Network Trace tool is not working on ASE currently
                if (serverFarm.sku.tier === "Standard" || serverFarm.sku.tier === "Basic" || serverFarm.sku.tier.indexOf("Premium") > -1) {
                    this.supportedTier = true;

                    this._siteService.getSiteAppSettings(this.siteToBeDiagnosed.subscriptionId, this.siteToBeDiagnosed.resourceGroupName, this.siteToBeDiagnosed.siteName, this.siteToBeDiagnosed.slot).subscribe(settingsResponse => {
                        if (settingsResponse && settingsResponse.properties) {
                            if (settingsResponse.properties["WEBSITE_LOCAL_CACHE_OPTION"]) {
                                this.localCacheEnabled = settingsResponse.properties["WEBSITE_LOCAL_CACHE_OPTION"] == "Always";
                                if (this.localCacheEnabled) {
                                    this.traceLocation = "d:\\home\\logfiles\\{InstanceId}\\networktrace"
                                }
                            }
                        }

                        this._siteService.getVirtualNetworkConnectionsInformation(this.siteToBeDiagnosed.subscriptionId, this.siteToBeDiagnosed.resourceGroupName, this.siteToBeDiagnosed.siteName, this.siteToBeDiagnosed.slot).subscribe(virtualNetworkConnectionsResponse => {
                            this.checkingValidity = false;
                            if (virtualNetworkConnectionsResponse && virtualNetworkConnectionsResponse.length > 0) {
                                this.supportedTier = false;
                            }
                        });
                    });
                }
            }
        }, error => {
            this.error = error;
        });
    }

    collectNetworkTrace() {
        this._loggerLocal.LogClickEvent("Collect Network Trace", "DiagnosticTools");
        this.inProgress = true;
        this.startNetworkTrace(this.siteToBeDiagnosed).subscribe(result => {
            if (result.properties) {
                if (result.properties.indexOf('.cap') > 0) {
                    this.networkTraceStarted = true;
                    let fileArray = result.properties.split('\r\n');
                    fileArray.forEach(x => {
                        if (x.length > 0) {
                            this.files.push(x);
                        }
                    })
                }
                else {
                    this.alreadyRunning = true;
                }
            }
        }, error => {
            this.error = error;
        });
    }

    startNetworkTrace(site: SiteInfoMetaData): Observable<NetworkTraceResult> {
        let resourceUri: string = this._uriElementsService.getNetworkTraceUrl(site) + "?duration=" + this.duration;
        return <Observable<NetworkTraceResult>>(this._armClient.postResource(resourceUri, null, null, true));
    }

}