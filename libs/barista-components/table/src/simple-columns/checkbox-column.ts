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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Optional,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DtTable } from '../table';
import { DtSimpleColumnBase } from '../simple-columns';
import { DtCheckboxChange } from '@dynatrace/barista-components/checkbox';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { isNil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import {
  DT_SELECTABLE_COLUMN_TOKEN,
  DtSelectableColumn,
} from '../selection/selection';

/**
 * displayAccessor that provides the selection state of a specific table row
 */
export interface DtCheckboxColumnDisplayAccessor {
  disabled?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
}

@Component({
  selector: 'dt-checkbox-column',
  templateUrl: './checkbox-column.html',
  styleUrls: ['./checkbox-column.scss'],
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    { provide: DtSimpleColumnBase, useExisting: DtCheckboxColumn },
    { provide: DT_SELECTABLE_COLUMN_TOKEN, useExisting: DtCheckboxColumn },
  ],
})
export class DtCheckboxColumn<T> extends DtSimpleColumnBase<T>
  implements DtSelectableColumn<T> {
  /**
   * Forwards the 'DtCheckboxChange' event when a specific table row is clicked
   */
  @Output()
  readonly checkboxRowChanged = new EventEmitter<DtCheckboxChange<T>>();

  /**
   * Forwards the 'DtCHeckboxChange' event of the checkbox displayed in the column header
   */
  @Output()
  readonly checkboxHeaderChanged = new EventEmitter<DtCheckboxChange<T>>();

  /**
   * Fires an event when either the checkbox of a table row or the checkbox header is clicked
   * The event value is the value of the table row that is clicked or null if the header checkbox is clicked
   */
  @Output()
  readonly selectionToggled = new EventEmitter<T | null>();

  /**
   * Flag that determines whether the checkbox in the column header is shown or not
   * Defaults to true
   */
  @Input()
  showHeaderCheckbox = true;

  private _anySelected = false;

  private _checked$: Map<T, BehaviorSubject<boolean>> = new Map<
    T,
    BehaviorSubject<boolean>
  >();
  private _disabled$: Map<T, BehaviorSubject<boolean>> = new Map<
    T,
    BehaviorSubject<boolean>
  >();
  private _indeterminate$: Map<T, BehaviorSubject<boolean>> = new Map<
    T,
    BehaviorSubject<boolean>
  >();

  _anySelected$ = new BehaviorSubject<boolean>(false);

  /**
   * Function to provide aria-labels for table rows based on the row value or undefined for the header checkbox
   */
  @Input()
  ariaLabelProvider: (value: T | undefined) => string = () => this.label;

  /**
   * @param value whether any table row is currently selected or not
   */
  @Input()
  set anySelected(value: boolean) {
    this._anySelected = value;
    this._anySelected$.next(value && !this.allSelected);
  }

  /**
   * Whether all table rows are currently selected or not
   */
  @Input() private _allSelected = false;

  get allSelected(): boolean {
    return this._allSelected;
  }

  set allSelected(value: boolean) {
    this._allSelected = value;
    this._anySelected$.next(this._anySelected && !this._allSelected);
  }

  constructor(@Optional() table: DtTable<T>) {
    super(table);
  }

  _isDisabled(value: T): Observable<boolean> {
    return this._updateValue(value, this._disabled$, (acc) => acc.disabled);
  }

  _isChecked(value: T): Observable<boolean> {
    return this._updateValue(value, this._checked$, (acc) => acc.checked);
  }

  _isIndeterminate(value: T): Observable<boolean> {
    return this._updateValue(
      value,
      this._indeterminate$,
      (acc) => acc.indeterminate,
    );
  }

  private _updateValue(
    value: T,
    map: Map<T, Subject<boolean>>,
    acc: (val: DtCheckboxColumnDisplayAccessor) => boolean | undefined,
  ): Observable<boolean> {
    let obs =
      map.get(value) ??
      new BehaviorSubject(this._getStateFromAccessor(value, acc));
    if (!map.has(value)) {
      obs.pipe(finalize(() => map.delete(value)));
      map.set(value, obs);
    } else {
      obs.next(this._getStateFromAccessor(value, acc));
    }
    return obs;
  }

  private _getStateFromAccessor(
    value: T,
    accessorValue: (
      param: DtCheckboxColumnDisplayAccessor,
    ) => boolean | undefined,
  ): boolean {
    if (!isNil(this.displayAccessor)) {
      return accessorValue(this.displayAccessor(value, name)) ?? false;
    }
    const accessor = ((value as unknown) as DtCheckboxColumnDisplayAccessor)[
      this.name
    ];
    if (!isNil(accessor)) {
      return accessorValue(accessor) ?? false;
    }
    return false;
  }

  _toggleRow(changeEvent: DtCheckboxChange<T>, row: T): void {
    this.checkboxRowChanged.emit(changeEvent);
    this.selectionToggled.emit(row);
  }

  _toggleAllSelection(changeEvent: DtCheckboxChange<T>): void {
    this.checkboxHeaderChanged.emit(changeEvent);
    this.selectionToggled.emit(null);
  }
}
