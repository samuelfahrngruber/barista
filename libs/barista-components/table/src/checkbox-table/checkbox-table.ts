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
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Predicate,
  ViewEncapsulation,
} from '@angular/core';
import { DtTable } from '../table';
import { SelectionChange, SelectionModel } from '@angular/cdk/collections';
import {
  DtCheckboxColumnComponent,
  DtCheckboxColumnDisplayAccessor,
} from '../simple-columns/selectable-column.component';
import { DtCheckboxChange } from '@dynatrace/barista-components/checkbox';
import { DtTableDataSource } from '@dynatrace/barista-components/table';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'dt-checkbox-table',
  styleUrls: ['../table.scss'],
  templateUrl: '../table.html',
  exportAs: 'dtCheckboxTable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  preserveWhitespaces: false,
  host: {
    class: 'dt-table',
    '[class.dt-table-interactive-rows]': 'interactiveRows',
  },
  providers: [{ provide: DtTable, useExisting: DtCheckboxTable }],
})
export class DtCheckboxTable<T> extends DtTable<T>
  implements AfterContentInit, OnDestroy {
  private _selectionLimit: number | null = null;
  private _isSelectable: Predicate<T> = () => true;
  private _selectionModel = new SelectionModel<T>(true, [], true);
  private _untilDestroy$ = new Subject<any>();
  private _subscriptions: Subscription[] = [];

  @Output()
  selectionChanged = new EventEmitter<SelectionChange<T>>();

  @Input()
  get selectionLimit(): number | null {
    return this._selectionLimit;
  }
  set selectionLimit(value: number | null) {
    if (value == 1 && this._selectionLimit != 1) {
      this._selectionModel = new SelectionModel(false, [], true);
    }
    this._selectionLimit = value;
  }

  @Input()
  set isSelectable(predicate: Predicate<T>) {
    this._isSelectable = predicate;
  }

  @ContentChild(DtCheckboxColumnComponent)
  _selectableColumn: DtCheckboxColumnComponent<T>;

  renderRows(): void {
    super.renderRows();
    this._updateSelectableColumn();
  }

  ngAfterContentInit(): void {
    if (this._selectableColumn) {
      this._selectionModel.changed
        .pipe(takeUntil(this._untilDestroy$))
        .subscribe((changeEvent: SelectionChange<T>) => {
          this.selectionChanged.emit(changeEvent);
        });
      this._selectableColumn.displayAccessor = (
        data: T,
      ): DtCheckboxColumnDisplayAccessor => {
        return {
          disabled:
            (!this._isSelectable(data) || this._isSelectionLimitReached()) &&
            !this._selectionModel.isSelected(data) &&
            this._selectionModel.isMultipleSelection(),
          checked: this._selectionModel.isSelected(data),
          indeterminate: false,
        };
      };
      this._subscriptions.push(
        this._selectableColumn.toggleAll.subscribe(() => {
          if (
            this._isSelectionLimitReached() ||
            this._selectionModel.selected.length ==
              this._getSelectableData().length
          ) {
            this._selectionModel.deselect(...this._selectionModel.selected);
          } else {
            if (
              this._selectionLimit != null &&
              this._selectionLimit < this._getSelectableData().length
            ) {
              let selection = this._selectionModel.selected;
              const entriesToAdd = this._selectionLimit - selection.length;
              let addedSelection = this._getSelectableData()
                .filter((entry) => selection.indexOf(entry) < 0)
                .slice(0, entriesToAdd);
              this._selectionModel.select(...addedSelection);
            } else {
              this._selectionModel.select(...this._getSelectableData());
            }
          }
          this._updateSelectableColumn();
        }),
      );
      this._subscriptions.push(
        this._selectableColumn.selectionToggled.subscribe(
          (event: DtCheckboxChange<T>) => {
            this._selectionModel.toggle(event.source.value);
            this._updateSelectableColumn();
          },
        ),
      );
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._untilDestroy$.next();
    this._untilDestroy$.complete();
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getSelection(): T[] {
    return this._selectionModel.selected;
  }

  setSelection(selection: T[]): void {
    this._selectionModel.select(...selection);
  }

  private _isSelectionLimitReached(): boolean {
    return (
      this._selectionLimit != null &&
      this._selectionModel.selected.length >= this._selectionLimit
    );
  }

  private _updateSelectableColumn(): void {
    this._selectableColumn.anySelected =
      this._selectionModel.selected.length > 0;
    this._selectableColumn.allSelected =
      this._selectionModel.selected.length ===
        this._getSelectableData().length || this._isSelectionLimitReached();
  }

  private _getSelectableData(): T[] {
    if (this.dataSource instanceof DtTableDataSource) {
      return this.dataSource.filteredData.filter(this._isSelectable);
    }
    return this._data.filter(this._isSelectable);
  }
}
