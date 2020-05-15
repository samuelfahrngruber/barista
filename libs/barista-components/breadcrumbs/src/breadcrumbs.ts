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
import { Subject, animationFrameScheduler } from 'rxjs';
import {
  startWith,
  takeUntil,
  observeOn,
  map,
  distinctUntilChanged,
} from 'rxjs/operators';

import { Constructor, mixinColor } from '@dynatrace/barista-components/core';

import { DtBreadcrumbsItem2 } from './breadcrumbs-item';
import { DomPortalOutlet, PortalOutlet, DomPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  Overlay,
  OverlayConfig,
  ConnectedPosition,
  OverlayRef,
} from '@angular/cdk/overlay';

declare const window: any;

const DT_BREADCRUMBS_OVERLAY_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
];

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

  private _containerContentRect$ = new Subject<DOMRect>();

  private _overlayRef: OverlayRef | null = null;

  private _itemsPortalsMap = new Map<DtBreadcrumbsItem2, PortalOutlet>();

  private _itemsWidthMap = new Map<DtBreadcrumbsItem2, number>();

  constructor(
    public elementRef: ElementRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _appRef: ApplicationRef,
    private _injector: Injector,
    @Inject(DOCUMENT) private _document: Document,
    private _overlay: Overlay,
  ) {
    super(elementRef);
  }

  ngAfterViewInit(): void {
    this._containerContentRect$
      .pipe(
        takeUntil(this._destroy$),
        observeOn(animationFrameScheduler),
        map((rect) => this._determineItemsToTransplant(rect)),
        distinctUntilChanged((oldTransplantedItems, newTransplantedItems) => {
          if (oldTransplantedItems.length !== newTransplantedItems.length) {
            return false;
          }
          return oldTransplantedItems.every(
            (item, index) => newTransplantedItems[index] === item,
          );
        }),
        map((items) => {
          const toTransplant: DtBreadcrumbsItem2[] = [];
          const toPutBack: DtBreadcrumbsItem2[] = [];

          for (const item of items) {
            if (!this._itemsPortalsMap.has(item)) {
              toTransplant.push(item);
            }
          }

          for (const item of this._itemsPortalsMap.keys()) {
            if (!items.includes(item)) {
              toPutBack.push(item);
            }
          }

          return {
            toTransplant,
            toPutBack,
          };
        }),
      )
      .subscribe(({ toTransplant, toPutBack }) => {
        if (!this._overlayRef) {
          this._createOverlay();
        }
        for (const item of toPutBack) {
          const portalOutlet = this._itemsPortalsMap.get(item);
          if (portalOutlet) {
            portalOutlet.detach();
          }
          this._itemsPortalsMap.delete(item);
        }

        for (const item of toTransplant) {
          const portalOutlet = new DomPortalOutlet(
            this._overlayRef!.overlayElement,
            this._componentFactoryResolver,
            this._appRef,
            this._injector,
            this._document,
          );
          portalOutlet.attachDomPortal(
            new DomPortal(item._elementRef.nativeElement),
          );
          this._itemsPortalsMap.set(item, portalOutlet);
        }

        if (this._itemsPortalsMap.size === 0) {
          this._overlayRef?.dispose();
          this._overlayRef = null;
        }
      });

    if ('ResizeObserver' in window) {
      this._containerSizeObserver = new window.ResizeObserver((entries) => {
        if (entries && entries[0]) {
          this._containerContentRect$.next(entries[0].contentRect);
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
          if (!this._itemsWidthMap.has(item)) {
            this._itemsWidthMap.set(
              item,
              item._elementRef.nativeElement.getBoundingClientRect().width,
            );
            // TODO for newly added items - create portal, render the item with the correct item styles and store width
          }
        });
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
  }

  /** Determines the items that need to be transplanted by checking which items fit into the container width */
  private _determineItemsToTransplant(
    containerRect: DOMRect,
  ): DtBreadcrumbsItem2[] {
    let remainingContainerWidth = containerRect.width;
    // start from the last item
    const items = this._items.toArray().reverse();
    for (const [index, item] of items.entries()) {
      // substract the item width from the container width
      remainingContainerWidth =
        remainingContainerWidth - (this._itemsWidthMap.get(item) || 0);
      if (remainingContainerWidth < 0) {
        console.log(index);
        return items.slice(index);
      }
    }
    return [];
  }

  private _createOverlay(): void {
    const overlayConfig: OverlayConfig = {
      positionStrategy: this._overlay
        .position()
        .flexibleConnectedTo(this._elementRef)
        .withPositions(DT_BREADCRUMBS_OVERLAY_POSITIONS),
      panelClass: 'dt-overlay-container',
    };
    this._overlayRef = this._overlay.create(overlayConfig);
  }
}
