import { Component } from '@angular/core';
import { Globals } from '../../../globals';
import { DetectorControlService } from 'projects/diagnostic-data/src/lib/services/detector-control.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'detector-command-bar',
  templateUrl: './detector-command-bar.component.html',
  styleUrls: ['./detector-command-bar.component.scss']
})
export class DetectorCommandBarComponent {
  time: string;

  constructor(private globals: Globals, private detectorControlService: DetectorControlService, private _route: ActivatedRoute) { }

  toggleOpenState() {
    this.globals.openGeniePanel = !this.globals.openGeniePanel;
  }

  sendFeedback() {
    this.globals.openFeedback = !this.globals.openFeedback;
  }

  refreshPage() {
    let childRouteSnapshot = this._route.firstChild.snapshot;
    let childRouteType = childRouteSnapshot.url[0].toString();
    let instanceId = childRouteType === "overview" ? this._route.snapshot.params["category"] : childRouteType === "detectors" ? childRouteSnapshot.params["detectorName"] : childRouteSnapshot.params["analysisId"] ;
    if (instanceId)
    {
      this.detectorControlService.refresh(instanceId);
    }
  }

  toggleOpenTimePicker() {
    // setTimeout(() => {this.globals.openTimePicker = !this.globals.openTimePicker},0);
    this.globals.openTimePicker = !this.globals.openTimePicker
  }

  updateMessage(s: string) {
    this.time = s;
  }

  closeTimePicker() {
    this.globals.openTimePicker = false;
  }
}
