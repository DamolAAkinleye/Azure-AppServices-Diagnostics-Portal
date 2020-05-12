import { Component, OnInit } from '@angular/core';
import { AdalService } from 'adal-angular4';
import {AadAuthGuard} from './shared/auth/aad-auth-guard.service';
import { environment } from '../environments/environment';
import * as Highcharts from 'highcharts';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { ApplensAppinsightsTelemetryService } from './shared/services/applens-appinsights-telemetry.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  env = environment;
  showBanner = true;
  constructor(private _adalService: AdalService, public _authGuardService: AadAuthGuard, private _applensAppinsightsTelemetryService: ApplensAppinsightsTelemetryService) {
    if (environment.adal.enabled){
      this._adalService.init({
        clientId: environment.adal.clientId,
        popUp: window.parent !== window,
        redirectUri: `${window.location.origin}`,
        postLogoutRedirectUri: `${window.location.origin}/login`,
        cacheLocation: 'localStorage'
       });
    }
  }

  ngOnInit() {
    initializeIcons('https://static2.sharepointonline.com/files/fabric/assets/icons/');
  }

  hideBanner(){
    this.showBanner = false;
  }
}
