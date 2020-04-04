import { Component, OnInit, Injector } from '@angular/core';
import { MessageProcessor } from '../../../supportbot/message-processor.service';
import { ActivatedRoute, Router, NavigationExtras, NavigationEnd, Scroll, ChildActivationEnd } from '@angular/router';
import { CategoryService } from '../../../shared-v2/services/category.service';
import { Category } from '../../../shared-v2/models/category';
import { CategoryChatStateService } from '../../../shared-v2/services/category-chat-state.service';
import { INavProps, INavLink, INav, autobind, INavStyles } from 'office-ui-fabric-react';
import { GenericApiService } from '../../../shared/services/generic-api.service';
import { CategoriesService } from '../../../shared/services/categories.service';
import { FeatureService } from '../../../shared-v2/services/feature.service';
import { Tile } from '../../../shared/components/tile-list/tile-list.component';
import { Feature } from '../../../shared-v2/models/features';
import { AuthService } from '../../../startup/services/auth.service';
import { DiagnosticService, DetectorMetaData, DetectorType, DetectorCommandService } from 'diagnostic-data';
import { filter, tap } from 'rxjs/operators';
import { PortalActionService } from '../../../shared/services/portal-action.service';
import { Globals } from '../../../globals';

@Component({
    selector: 'category-summary',
    templateUrl: './category-summary.component.html',
    styleUrls: ['./category-summary.component.scss'],
    providers: [CategoryChatStateService]
})
export class CategorySummaryComponent implements OnInit {
    showChoiceGroup: boolean = true;
    currentRoutePath: string[];
    allProblemCategories: Category[] = [];
    features: Feature[];
    tiles: Tile[];

    startingKey: string;

    category: Category;
    categoryName: string;
    resourceId = "";
    baseUrl = "";
    resourceName = "";

    groups: any;
    counter: number = 0;

    initialSelectedKey: INavProps["initialSelectedKey"] = "overview";
    selectedKey: INavProps["initialSelectedKey"];

    styles: any;

    selectedCategoryIndex = "1";

    openPanel: boolean = false;
    routedComponent: any;

    refreshSubscriptionObject: any;
    childRoutedComponent: any;

    setFocusOnCallpsibleButton() {
        document.getElementById("collapse-genie-button").focus();
    }
    closeGeniePanel() {
        this.globals.openGeniePanel = false;
        this.openPanel = false;
    }

    openGeniePanel() {
        this.globals.openGeniePanel  = true;
    }

    setCategoryIndex(event:any) {
        const categoryIndex = event.option.key;
        this.selectedCategoryIndex = categoryIndex;
      }

    public onRouterOutletActivate(componentRef : any) {
        if (this.refreshSubscriptionObject)
        {
            this.refreshSubscriptionObject.unsubscribe();
        }

        this.detectorCommandService.resetRefresBehaviorSubject();
        this.routedComponent = componentRef;

        this.refreshSubscriptionObject = this.detectorCommandService.update.subscribe(refresh => {
            if (refresh)
            {
                this.routedComponent.refresh();
          //      this.childRoutedComponent.refresh();
            }
        });
    }
    
    constructor(protected _diagnosticApiService: DiagnosticService, private _route: Router, private _injector: Injector, private _activatedRoute: ActivatedRoute, private categoryService: CategoryService,
        private _chatState: CategoryChatStateService, private _genericApiService: GenericApiService
        , private _featureService: FeatureService, protected _authService: AuthService, private _portalActionService: PortalActionService, private globals: Globals, private detectorCommandService: DetectorCommandService) {
    }
 
    ngOnInit() {
        this.categoryService.categories.subscribe(categories => {
          let decodedCategoryName = this._activatedRoute.snapshot.params.category.toLowerCase();
            this.category = categories.find(category => category.id.toLowerCase() === this._activatedRoute.snapshot.params.category.toLowerCase() ||  category.name.replace(/\s/g, '').toLowerCase() === decodedCategoryName);
            this._chatState.category = this.category;
            this.categoryName = this.category.name;

            this.resourceName = this._activatedRoute.snapshot.params.resourcename;
            this._portalActionService.updateDiagnoseCategoryBladeTitle(`${this.resourceName} - ` + this.categoryName);
        });

        // this._route.events.pipe().subscribe(event => {
        //     console.log("Navigation event", event);
        // });

        // console.warn("Call ngOnInit on detectorId:", this._activatedRoute.url);

        // this._route.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
        //     console.log("In category Summary Navigation End,", event);
        //     console.log("In current activatd router",   this._activatedRoute, this._activatedRoute.firstChild.component);
        //     this.childRoutedComponent = this._activatedRoute.firstChild.component;
        //     const childComponentInstance: any = this._activatedRoute.firstChild.component;
        //     childComponentInstance.refresh.apply(this);
        // });

        // this._activatedRoute.url.subscribe(url => {
        //     console.warn("category summary",url, this._activatedRoute.firstChild.component);
        //     const childComponentInstance: any = this._activatedRoute.firstChild.component;
        //     childComponentInstance.refresh.apply(this);
        // });
    }

    navigateTo(path: string) {
        let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'preserve',
            preserveFragment: true,
            relativeTo: this._activatedRoute
        };
        this._route.navigate(path.split('/'), navigationExtras);
    }

    ngOnDestroy() {
        if (this.refreshSubscriptionObject)
        {
            this.refreshSubscriptionObject.unsubscribe();
        }
      }
}
