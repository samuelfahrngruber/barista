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

import { Directive, ElementRef, ChangeDetectorRef } from '@angular/core';
import {
  Highlightable,
  InteractivityChecker,
  FocusMonitor,
} from '@angular/cdk/a11y';
import { Subject } from 'rxjs';

/**
 * A breadcrumbs item that can be used within the `<dt-breadcrumbs>`.
 *
 *  @example
 *  <a dtBreadcrumbsItem href="/hosts">Hosts</a>
 */
@Directive({
  selector: 'a[dt-breadcrumbs-item], a[dtBreadcrumbsItem]',
  exportAs: 'dtBreadcrumbsItem',
  host: {
    class: 'dt-breadcrumbs-item',
    '[class.dt-breadcrumbs-item-active]': '_active',
    '[class.dt-breadcrumbs-item-non-interactive]': '!_isFocusable',
    '(keydown)': '_onKeyDown($event)',
  },
})
export class DtBreadcrumbsItem2 implements Highlightable {
  constructor(
    readonly _elementRef: ElementRef<HTMLAnchorElement>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _interactivityChecker: InteractivityChecker,
    private _focusMonitor: FocusMonitor,
  ) {
    this._focusMonitor.monitor(this._elementRef.nativeElement);
  }

  _active: boolean = false;

  get _isFocusable(): boolean {
    return this._interactivityChecker.isFocusable(
      this._elementRef.nativeElement,
    );
  }

  _onKeyDown$ = new Subject<KeyboardEvent>();

  /** Applies the styles for an active item to this item. Part of the Highlightable interface */
  setActiveStyles(): void {
    if (!this._active && this._isFocusable) {
      this._active = true;
      // Does this make sense here?
      this._elementRef.nativeElement.focus();
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Applies the styles for an inactive item to this item. Part of the Highlightable interface */
  setInactiveStyles(): void {
    if (this._active && this._isFocusable) {
      this._active = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  /** @internal */
  _setCurrent(current: boolean): void {
    const element: Element = this._elementRef.nativeElement;
    if (element && element.setAttribute) {
      if (current) {
        element.setAttribute('aria-current', 'page');
      } else {
        element.removeAttribute('aria-current');
      }
    }
  }

  _onKeyDown(event: KeyboardEvent): void {
    this._onKeyDown$.next(event);
  }
}
