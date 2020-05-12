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

export interface DtCheckboxColumnDisplayAccessor {
  disabled: boolean;
  checked: boolean;
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
export class DtCheckboxColumnComponent<T> extends DtSimpleColumnBase<T> {
  @Output()
  readonly checkBoxToggled = new EventEmitter<DtCheckboxChange<T>>();
  @Output()
  readonly toggleAllEvent = new EventEmitter<DtCheckboxChange<T>>();

  @Input()
  showHeaderCheckbox = true;

  @Input()
  allSelected = false;

  @Input()
  anySelected = false;

  constructor(@Optional() public table: DtTable<T>) {
    super(table);
  }

  isDisabled(value: T) {
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

  isChecked(value: T) {
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

  isAnySelected() {
    return !this.allSelected && this.anySelected;
  }

  toggleRow(changeEvent: DtCheckboxChange<T>, row: T) {
    changeEvent.source.value = row;
    this.checkBoxToggled.emit(changeEvent);
  }

  toggleAll(changeEvent: DtCheckboxChange<T>) {
    this.toggleAllEvent.emit(changeEvent);
  }
}
