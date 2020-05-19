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

export interface DtCheckboxColumnDisplayAccessor {
  disabled: boolean;
  checked: boolean;
  indeterminate: boolean;
}

export interface DtSelectableColumn<T> {
  selectionToggled: EventEmitter<DtCheckboxChange<T>>;
  toggleAll: EventEmitter<DtCheckboxChange<T>>;
  name: string;
  displayAccessor: DtSimpleColumnDisplayAccessorFunction<T>;
  allSelected: boolean;
  anySelected: boolean;
}

@Component({
  selector: 'dt-checkbox-column',
  templateUrl: './selectable-column.component.html',
  styleUrls: ['./selectable-column.component.scss'],
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    { provide: DtSimpleColumnBase, useExisting: DtCheckboxColumnComponent },
  ],
})
export class DtCheckboxColumnComponent<T> extends DtSimpleColumnBase<T>
  implements DtSelectableColumn<T> {
  @Output()
  readonly selectionToggled = new EventEmitter<DtCheckboxChange<T>>();
  @Output()
  readonly toggleAll = new EventEmitter<DtCheckboxChange<T>>();

  @Input()
  showHeaderCheckbox = true;

  @Input()
  allSelected = false;

  @Input()
  anySelected = false;

  constructor(@Optional() public table: DtTable<T>) {
    super(table);
  }

  isDisabled(value: T): boolean {
    if (this.displayAccessor) {
      return this.displayAccessor(value, this.name).disabled;
    }
    const accessor = ((value as unknown) as DtCheckboxColumnDisplayAccessor)[
      this.name
    ];
    if (accessor) {
      return accessor.disabled;
    }
    return false;
  }

  isChecked(value: T): boolean {
    if (this.displayAccessor) {
      return this.displayAccessor(value, this.name).checked;
    }
    const accessor = ((value as unknown) as DtCheckboxColumnDisplayAccessor)[
      this.name
    ];
    if (accessor) {
      return accessor.checked;
    }
    return false;
  }

  isInDeterminate(value: T): boolean {
    if (this.displayAccessor) {
      return this.displayAccessor(value, this.name).indeterminate;
    }
    const accessor = ((value as unknown) as DtCheckboxColumnDisplayAccessor)[
      this.name
    ];
    if (accessor) {
      return accessor.indeterminate;
    }
    return false;
  }

  isAnySelected(): boolean {
    return !this.allSelected && this.anySelected;
  }

  toggleRow(changeEvent: DtCheckboxChange<T>, row: T): void {
    changeEvent.source.value = row;
    this.selectionToggled.emit(changeEvent);
  }

  toggleAllSelection(changeEvent: DtCheckboxChange<T>): void {
    this.toggleAll.emit(changeEvent);
  }
}
