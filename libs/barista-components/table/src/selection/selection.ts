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
  AfterViewInit,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Predicate,
} from '@angular/core';
import { DtSelectableColumn } from '../simple-columns/selectable-column.component';
import { isNil } from 'lodash-es';
import { takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  DtSimpleColumnBase,
  DtSimpleColumnDisplayAccessorFunction,
} from '../simple-columns';

export interface DtSelectionChangeEvent<T> {
  toggledRow: T | null;
}

/** Container for DtSortHeaders to manage the sort state and provide default sort parameters. */
@Directive({
  selector: '[dtSelection]',
  exportAs: 'dtSelection',
})
export class DtSelection<T> implements AfterViewInit, OnDestroy {
  @Output('dtSelectionChange')
  readonly selectionChange: EventEmitter<T | null> = new EventEmitter<T | null>();

  @Input()
  selectionLimit: number | undefined = undefined;

  @Input()
  selectable: Predicate<T> = () => true;

  private _selectableColumn: DtSelectableColumn<T> | undefined;

  /** @internal Initialized subject that fires on initialization and completes on destroy. */
  readonly _initialized = new BehaviorSubject<boolean>(false);

  constructor(_column: DtSimpleColumnBase<T>) {
    this._selectableColumn = (_column as unknown) as DtSelectableColumn<T>;
    if (!isNil(this._selectableColumn)) {
      this._selectableColumn.selectionToggled
        .pipe(
          takeUntil(this._destroy),
          tap((event: T | null) => {
            this.selectionChange.emit(event);
          }),
        )
        .subscribe();
      this._updateDisplayAccessor();
    }
  }

  private _displayAccessor:
    | DtSimpleColumnDisplayAccessorFunction<T>
    | undefined;

  set displayAccessor(accessor: DtSimpleColumnDisplayAccessorFunction<T>) {
    this._displayAccessor = accessor;
    this._updateDisplayAccessor();
  }

  set allSelected(allSelected: boolean) {
    if (!isNil(this._selectableColumn)) {
      this._selectableColumn.allSelected = allSelected;
    }
  }

  set anySelected(anySelected: boolean) {
    if (!isNil(this._selectableColumn)) {
      this._selectableColumn.anySelected = anySelected;
    }
  }

  private _destroy = new Subject<void>();

  ngAfterViewInit(): void {
    this._initialized.next(true);
  }

  ngOnDestroy(): void {
    this._destroy.complete();
    this._initialized.complete();
  }

  private _updateDisplayAccessor(): void {
    if (!isNil(this._selectableColumn) && !isNil(this._displayAccessor)) {
      this._selectableColumn.displayAccessor = this._displayAccessor;
    }
  }
}
