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

import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Predicate,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DtSimpleColumnDisplayAccessorFunction } from '../simple-columns/simple-column-base';

/**
 * Token used to inject a 'DtSelectableColumn'
 */
// export const DT_SELECTABLE_COLUMN_TOKEN = 'DtSelectableColumn';

/**
 * Interface that has to be implemented by table columns that support default selection handling
 */
export interface DtSelectableColumn<T> {
  selectionToggled: Observable<T | null>;
  name: string;
  displayAccessor: DtSimpleColumnDisplayAccessorFunction<T>;
  allSelected?: boolean;
  anySelected?: boolean;
}

/**
 * Directive for managing selection changes of a DtSelectableColumn.
 * The directive has to be set on a table column that provides the 'DtSelectableColumn'
 */
@Directive({
  selector: '[dtSelection]',
  exportAs: 'dtSelection',
})
export class DtSelection<T> implements AfterViewInit, OnDestroy {
  /**
   * Fires an event when the selection of the DtSelectableColumn changes
   * The event value will be the row that was toggled or null if the event affects all rows
   */
  @Output('dtSelectionChange')
  readonly selectionChange: EventEmitter<T | null> = new EventEmitter<T | null>();

  /**
   * Limits how many table rows can be selected
   * Unlimited by default
   */
  @Input()
  selectionLimit: number | undefined = undefined;

  /**
   * Predicate to determine which table rows can be selected
   * By default all rows are selectable
   */
  @Input()
  selectable: Predicate<T> = () => true;

  /** @internal Initialized subject that fires on initialization and completes on destroy. */
  readonly _initialized = new BehaviorSubject<boolean>(false);

  _selectionModel = new SelectionModel<T>(true);

  constructor() {
    // this._selectableColumn = (_column as unknown) as DtSelectableColumn<T>;
    // this._selectableColumn.selectionToggled
    //   .pipe(
    //     takeUntil(this._destroy),
    //     tap((event: T | null) => {
    //       this.selectionChange.emit(event);
    //     }),
    //   )
    //   .subscribe();
  }

  // /**
  //  * @param accessor custom display accessor that provides the state of a given table row to the 'DtSelectableColumn'
  //  */
  // set displayAccessor(accessor: DtSimpleColumnDisplayAccessorFunction<T>) {
  //   //Call this async to prevent 'Expression has changed after it was checked' errors
  //   setTimeout(() => {
  //     this._selectableColumn.displayAccessor = accessor;
  //   });
  // }

  // /**
  //  * @param allSelected whether all table rows are currently selected or not
  //  */
  // set allSelected(allSelected: boolean) {
  //   this._selectableColumn.allSelected = allSelected;
  // }

  // /**
  //  * @param anySelected whether any table row is currently selected or not
  //  */
  // set anySelected(anySelected: boolean) {
  //   this._selectableColumn.anySelected = anySelected;
  // }

  // private _destroy = new Subject<void>();

  ngAfterViewInit(): void {
    this._initialized.next(true);
  }

  ngOnDestroy(): void {
    // this._destroy.complete();
    this._initialized.complete();
  }
}
