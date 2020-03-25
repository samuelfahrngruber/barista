import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import {
  CollectionViewer,
  isDataSource,
  SelectionModel,
} from '@angular/cdk/collections';
import { DtTable } from '../table';
import { DtSimpleColumnBase } from '../simple-columns';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { ListRange } from '@angular/cdk/collections';
import { takeUntil } from 'rxjs/operators';
import { DtTableDataSource } from '../table-data-source';

export interface DtSelectableColumnChangedEvent<T> {
  row: T;
  checked: boolean;
}

export interface DtSelectionChangedEvent<T> {
  selection: T[];
}

@Component({
  selector: 'dt-selectable-column',
  templateUrl: './selectable-column.component.html',
  styleUrls: ['./selectable-column.component.scss'],
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DtSimpleColumnBase, useExisting: DtSelectableColumnComponent },
  ],
})
export class DtSelectableColumnComponent<T> extends DtSimpleColumnBase<T>
  implements CollectionViewer, OnDestroy {
  @Input()
  selection = new SelectionModel<T>(true);
  @Input()
  selectionLimit: number | null = null;

  @Output()
  readonly rowChanged = new EventEmitter<DtSelectableColumnChangedEvent<T>>();

  @Output()
  readonly selectionChanged = new EventEmitter<DtSelectionChangedEvent<T>>();

  viewChange: Observable<ListRange> = new BehaviorSubject<ListRange>({
    start: 0,
    end: Number.MAX_VALUE,
  });

  data: T[] = [];

  private _onDestroy = new Subject<void>();
  private dataSubscription: Subscription | undefined;

  constructor(
    @Optional() public table: DtTable<T>,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    super(table);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.updateDataSource();
  }

  private updateDataSource() {
    let dataStream$: Observable<any> | undefined;
    if (this.table.dataSource instanceof DtTableDataSource) {
      dataStream$ = this.table.dataSource.filteredDataChange$;
    } else if (isDataSource(this.table.dataSource)) {
      dataStream$ = this.table.dataSource.connect(this);
    } else if (this.table.dataSource instanceof Observable) {
      dataStream$ = this.table.dataSource;
    } else if (Array.isArray(this.table.dataSource)) {
      dataStream$ = of(this.table.dataSource);
    }
    if (dataStream$ === undefined) {
      return;
    }
    if (this.dataSubscription !== undefined) {
      this.dataSubscription.unsubscribe();
    }
    this.dataSubscription = dataStream$
      .pipe(takeUntil(this._onDestroy))
      .subscribe(data => this.updateData(data));
  }

  isAllSelected(): boolean {
    return this.getLimitedData().every((row: T) =>
      this.selection.selected.includes(row),
    );
  }

  isSelectionLimitReached(): boolean {
    return (
      this.selectionLimit != null &&
      this.selection.selected.length >= this.selectionLimit
    );
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      const selection = this.getLimitedData();
      this.selection.select(...selection);
    }
    this.selectionChanged.emit({
      selection: this.selection.selected,
    });
    this.changeDetectorRef.markForCheck();
  }

  get selected(): T[] {
    return this.selection.selected;
  }

  set selected(selected: T[]) {
    this.selection.clear();
    this.selection.select(...selected);
  }

  select(...values: T[]) {
    this.selection.select(...values);
  }

  deselect(...values: T[]) {
    this.selection.deselect(...values);
  }

  toggle(...values: T[]) {
    values.forEach(item => this.selection.toggle(item));
  }

  updateData(data: T[]) {
    this.data = data;
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  protected toggleRow(row: T): void {
    this.selection.toggle(row);
    this.rowChanged.emit({
      row: row,
      checked: this.selection.isSelected(row),
    });
    this.selectionChanged.emit({
      selection: this.selection.selected,
    });
    this.changeDetectorRef.markForCheck();
  }

  private getLimitedData(): T[] {
    if (this.selectionLimit != null) {
      const additionalEntries =
        this.selectionLimit - this.selection.selected.length;
      const remainingData = this.data.filter(
        row => !this.selection.isSelected(row),
      );
      return this.selection.selected.concat(
        remainingData.slice(
          0,
          Math.min(additionalEntries, remainingData.length),
        ),
      );
    }
    return this.data;
  }
}
