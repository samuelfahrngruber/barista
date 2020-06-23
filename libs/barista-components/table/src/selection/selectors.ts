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
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
  Predicate,
  ViewEncapsulation,
} from '@angular/core';
import { DtCheckboxChange } from '@dynatrace/barista-components/checkbox';
import { DtTable } from '../table';
import { DtTableSelection } from './selection';
import { Subscription } from 'rxjs';

/** Handles row selection in combination with the DtTableSelection directive on the table */
@Component({
  selector: 'dt-table-row-selector',
  template: ` <dt-cell class="dt-selectable-cell">
    <dt-checkbox
      [disabled]="disabled(row) || _disabledDueToLimit"
      [value]="row"
      [checked]="_isSelected"
      (change)="_toggleRow($event)"
    ></dt-checkbox>
  </dt-cell>`,
  styles: [
    `
      .dt-selectable-cell .dt-checkbox-content {
        display: none;
      }
      .dt-selectable-cell .dt-checkbox-container {
        margin-right: 0;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtTableRowSelector<T> implements OnDestroy {
  /** The rows data used for selection */
  @Input() row: T;

  /**
   * Whether the selection should be disabled
   * Defaults to false
   */
  @Input() disabled: Predicate<T> = () => false;

  /**
   * @internal Whether the checkbox should be disabled due to the selectionLimit
   * Whether the checkbox is disabled is determined based on whether the predicate is true or
   * the limit is reached and the row is currently not selected.
   */
  get _disabledDueToLimit(): boolean {
    return this._selector.selectionLimitReached && !this._isSelected;
  }

  /** @internal Whether the row is currently selected */
  get _isSelected(): boolean {
    return this._selector.isSelected(this.row);
  }

  /** Subscription for selectionChanges stored for cleanup */
  private _selectionChangedSubscription = Subscription.EMPTY;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _selector: DtTableSelection<T>,
  ) {
    this._selectionChangedSubscription = this._selector.selectionChange.subscribe(
      () => {
        this._changeDetectorRef.markForCheck();
      },
    );
  }

  ngOnDestroy(): void {
    this._selectionChangedSubscription.unsubscribe();
  }

  /** @internal Callback when the row is toggled by interacting with the checkbox */
  _toggleRow(changeEvent: DtCheckboxChange<T>): void {
    if (changeEvent.checked) {
      this._selector.select(this.row);
    } else {
      this._selector.deselect(this.row);
    }
  }
}

/** Provides a master toggle selection in the table's header in combination with the DtTableSelection directive */
@Component({
  selector: 'dt-table-header-selector',
  template: `
    <dt-header-cell class="dt-selectable-cell">
      <dt-checkbox
        (change)="_toggleAllSelection($event)"
        [checked]="_isAllSelected"
        [indeterminate]="_isAnySelected"
      ></dt-checkbox>
    </dt-header-cell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtTableHeaderSelector<T> implements OnDestroy {
  /** @internal Whether all rows are currently selected */
  get _isAllSelected(): boolean {
    const numSelected = this._selector.selected.length;
    const numRows = this._table._dataSnapshot.length;
    return numSelected == numRows;
  }

  /** @internal Whether any rows are currently selected - this sets the master checkbox to indeterminate */
  get _isAnySelected(): boolean {
    return this._selector.selected.length > 0 && !this._isAllSelected;
  }

  /** Subscription for selectionChanges stored for cleanup */
  private _selectionChangedSubscription = Subscription.EMPTY;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _selector: DtTableSelection<T>,
    private _table: DtTable<T>,
  ) {
    this._selectionChangedSubscription = this._selector.selectionChange.subscribe(
      () => this._changeDetectorRef.markForCheck(),
    );
  }

  ngOnDestroy(): void {
    this._selectionChangedSubscription.unsubscribe();
  }

  /** @internal Callback when the master checkbox is interacted with */
  _toggleAllSelection(changeEvent: DtCheckboxChange<T>): void {
    const data = this._table._dataSnapshot;
    if (changeEvent.checked) {
      this._selector.select(...data);
    } else {
      this._selector.clear();
    }
  }
}
