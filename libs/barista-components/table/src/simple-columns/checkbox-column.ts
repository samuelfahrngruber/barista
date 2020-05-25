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
import {
  DtSimpleColumnBase,
  DtSimpleColumnDisplayAccessorFunction,
} from '../simple-columns';
import { DtCheckboxChange } from '@dynatrace/barista-components/checkbox';
import { BehaviorSubject } from 'rxjs';

export interface DtCheckboxColumnDisplayAccessor {
  disabled?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
}

export interface DtSelectableColumn<T> {
  selectionToggled: EventEmitter<T | null>;
  name: string;
  displayAccessor: DtSimpleColumnDisplayAccessorFunction<T>;
  allSelected: boolean;
  anySelected: boolean;
}

@Component({
  selector: 'dt-checkbox-column',
  templateUrl: './checkbox-column.html',
  styleUrls: ['./checkbox-column.scss'],
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{ provide: DtSimpleColumnBase, useExisting: DtCheckboxColumn }],
})
export class DtCheckboxColumn<T> extends DtSimpleColumnBase<T>
  implements DtSelectableColumn<T> {
  @Output()
  readonly checkboxRowChanged = new EventEmitter<DtCheckboxChange<T>>();
  @Output()
  readonly checkboxHeaderChanged = new EventEmitter<DtCheckboxChange<T>>();
  @Output()
  readonly selectionToggled = new EventEmitter<T | null>();
  @Input()
  showHeaderCheckbox = true;

  private _anySelected = false;

  _anySelected$ = new BehaviorSubject<boolean>(false);

  @Input()
  set anySelected(value: boolean) {
    this._anySelected = value;
    this._anySelected$.next(value && !this.allSelected);
  }

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

  _isDisabled(value: T): boolean {
    if (this.displayAccessor) {
      return this.displayAccessor(value, this.name).disabled ?? false;
    }
    const accessor = ((value as unknown) as DtCheckboxColumnDisplayAccessor)[
      this.name
    ];
    if (accessor) {
      return accessor.disabled ?? false;
    }
    return false;
  }

  _isChecked(value: T): boolean {
    if (this.displayAccessor) {
      return this.displayAccessor(value, this.name).checked ?? false;
    }
    const accessor = ((value as unknown) as DtCheckboxColumnDisplayAccessor)[
      this.name
    ];
    if (accessor) {
      return accessor.checked ?? false;
    }
    return false;
  }

  _isIndeterminate(value: T): boolean {
    if (this.displayAccessor) {
      return this.displayAccessor(value, this.name).indeterminate ?? false;
    }
    const accessor = ((value as unknown) as DtCheckboxColumnDisplayAccessor)[
      this.name
    ];
    if (accessor) {
      return accessor.indeterminate ?? false;
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
