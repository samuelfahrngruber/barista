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

export interface IsEnabled {
  disabled: boolean;
}

@Component({
  selector: 'dt-checkbox-column',
  templateUrl: './selectable-column.component.html',
  styleUrls: ['./selectable-column.component.scss'],
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DtSimpleColumnBase, useExisting: DtSelectableColumnComponent },
  ],
})
export class DtSelectableColumnComponent<
  T extends IsEnabled
> extends DtSimpleColumnBase<T> {
  @Output()
  readonly checkBoxToggled = new EventEmitter<DtCheckboxChange<T>>();
  @Output()
  readonly toggleAllEvent = new EventEmitter<DtCheckboxChange<T>>();

  @Input()
  multiSelect: true;

  constructor(@Optional() public table: DtTable<T>) {
    super(table);
  }

  toggleRow(changeEvent: DtCheckboxChange<T>) {
    this.checkBoxToggled.emit(changeEvent);
  }

  toggleAll(changeEvent: DtCheckboxChange<T>) {
    this.toggleAllEvent.emit(changeEvent);
  }
}
