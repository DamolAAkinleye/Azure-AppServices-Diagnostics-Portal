import { Component, OnInit, ViewChild, TemplateRef, ElementRef, Renderer2, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../shared-v2/services/category.service';
import { Category } from '../../../shared-v2/models/category';
import { Globals } from '../../../globals';
import { DetectorContainerComponent } from 'projects/diagnostic-data/src/lib/components/detector-container/detector-container.component';
import { Refreshable } from '../../../shared/models/refreshable';

const suffix = ' cm';

@Component({
    selector: 'category-overview',
    templateUrl: './category-overview.component.html',
    styleUrls: ['./category-overview.component.scss',
    ]
})

export class CategoryOverviewComponent implements OnInit, Refreshable{
    @ViewChild(DetectorContainerComponent, { static: false }) detectorContainerComponent: DetectorContainerComponent;
    categoryId: string = "";
    category: Category;

    onValidate(value: string, event: Event): string | void {
        value = this._removeSuffix(value, suffix);
        if (value.trim().length === 0 || isNaN(+value)) {
            return '0' + suffix;
        }

        return String(value) + suffix;
    }

    private _hasSuffix(value: string, suffix: string): Boolean {
        const subString = value.substr(value.length - suffix.length);
        return subString === suffix;
    }

    private _removeSuffix(value: string, suffix: string): string {
        if (!this._hasSuffix(value, suffix)) {
            return value;
        }

        return value.substr(0, value.length - suffix.length);
    }

    constructor(private _activatedRoute: ActivatedRoute, private _router: Router, private _categoryService: CategoryService, private globals: Globals) {
    }

    ngOnInit() {
        let categoryParam = this._activatedRoute.parent.snapshot.params.category.toLowerCase();
        this._categoryService.categories.subscribe(categories => {
            this.category = categories.find(category => categoryParam === category.id.toLowerCase() || category.name.replace(/\s/g, '').toLowerCase() === categoryParam);
        });

        this.categoryId = this.category.id
    }

    refresh() {
        this.detectorContainerComponent.refresh(true);
    }
}
