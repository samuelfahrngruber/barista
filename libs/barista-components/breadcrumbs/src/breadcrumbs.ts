/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewEncapsulation,
  AfterViewInit,
  ComponentFactoryResolver,
  ApplicationRef,
  Injector,
  Inject,
} from '@angular/core';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

import { Constructor, mixinColor } from '@dynatrace/barista-components/core';

import { DtBreadcrumbsItem2 } from './breadcrumbs-item';
import {
  DomPortal,
  Portal,
  CdkPortalOutlet,
  DomPortalOutlet,
  PortalOutlet,
} from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';

declare const window: any;

export type DtBreadcrumbThemePalette = 'main' | 'error' | 'neutral';

// Boilerplate for applying mixins to DtBreadcrumb.
export class DtBreadcrumbBase {
  constructor(public _elementRef: ElementRef) {}
}

export const _DtBreadcrumbMixinBase = mixinColor<
  Constructor<DtBreadcrumbBase>,
  DtBreadcrumbThemePalette
>(DtBreadcrumbBase, 'main');
@Component({
  selector: 'dt-breadcrumbs',
  exportAs: 'dtBreadcrumbs',
  templateUrl: 'breadcrumbs.html',
  styleUrls: ['breadcrumbs.scss'],
  host: {
    class: 'dt-breadcrumbs',
  },
  inputs: ['color'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class DtBreadcrumbs extends _DtBreadcrumbMixinBase
  implements AfterContentInit, AfterViewInit, OnDestroy {
  @ContentChildren(DtBreadcrumbsItem2) private _items: QueryList<
    DtBreadcrumbsItem2
  >;

  private _containerSizeObserver: any;

  private _destroy$ = new Subject<void>();

  private _portalOutlet: PortalOutlet | null;

  constructor(
    public elementRef: ElementRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _appRef: ApplicationRef,
    private _injector: Injector,
    @Inject(DOCUMENT) private _document: Document,
  ) {
    super(elementRef);
  }

  ngAfterViewInit(): void {
    if ('ResizeObserver' in window) {
      this._containerSizeObserver = new window.ResizeObserver((entries) => {
        if (entries && entries[0]) {
          requestAnimationFrame(() => {
            let remainingContainerWidth = entries[0].contentRect.width;
            console.log(remainingContainerWidth);
            let lastVisibleIndex = this._items.length - 1;
            for (let i = lastVisibleIndex; i >= 0; i--) {
              const item: DtBreadcrumbsItem2 = this._items.toArray()[i];
              const itemNative = item._elementRef.nativeElement;
              remainingContainerWidth =
                remainingContainerWidth -
                itemNative.getBoundingClientRect().width;
              console.log('remaining', remainingContainerWidth);
              if (remainingContainerWidth < 0) {
                lastVisibleIndex = i;
                break;
              }
            }
            console.log(lastVisibleIndex);
          });
        }
      });
      this._containerSizeObserver.observe(this._elementRef.nativeElement);
    }
  }

  ngAfterContentInit(): void {
    this._items.changes
      .pipe(startWith(null), takeUntil(this._destroy$))
      .subscribe(() => {
        // We need to notify the items whether they are the last one in the list,
        // because they use this information to determine their active state.
        this._items.forEach((item, index) => {
          item._setCurrent(this._items.length - 1 === index);
        });

        // const fakeOverlay = this.elementRef.nativeElement.querySelector('.fake-element');
        // const portalOutlet = new DomPortalOutlet(fakeOverlay, this._componentFactoryResolver, this._appRef, this._injector, this._document);
        // portalOutlet.attachDomPortal(new DomPortal(this._items.first._elementRef.nativeElement));
        // this._portalOutlet = portalOutlet;
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  destroyPortal(): void {
    this._portalOutlet!.dispose();
    this._portalOutlet = null;
  }
}
