import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  DtHeaderRowDef,
  DtRowDef,
  DtSimpleColumnBase,
  DtTable,
  DtTableDataSource,
} from '@dynatrace/barista-components/table';
import { CdkColumnDef } from '@angular/cdk/table';

@Component({
  selector: 'dt-selectable-table',
  styleUrls: ['selectable-table.scss'],
  templateUrl: './selectable-table.html',
  exportAs: 'dtSelectableTable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  preserveWhitespaces: false,
})
export class DtSelectableTable<T> implements AfterViewInit {
  @ViewChild('table', { static: true }) _table: DtTable<T>;
  @ContentChildren(CdkColumnDef, { descendants: true }) columns: QueryList<
    CdkColumnDef
  >;
  @ContentChild(DtHeaderRowDef) _headerRowDef: DtHeaderRowDef;
  @ContentChild(DtRowDef) _rowDef: DtRowDef<T>;
  @ViewChild(DtHeaderRowDef) _tableHeaderRowDef: DtHeaderRowDef;
  @ViewChild(DtRowDef) _tableRowDef: DtRowDef<T>;
  @ContentChildren(DtSimpleColumnBase, { descendants: true })
  _simpleColumns: QueryList<DtSimpleColumnBase<T>>;

  @Input() headers: string[] = ['select'];
  @Input() dataSource: DtTableDataSource<T>;
  @Input() templateRef: TemplateRef<any>;

  constructor(readonly changeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    const iterator = this._headerRowDef.columns[Symbol.iterator]();
    let result = iterator.next();
    while (!result.done) {
      this.headers.push(result.value);
      result = iterator.next();
    }
    this._simpleColumns.forEach(col => {
      this._table.addColumnDef(col._columnDef);
    });
    this.changeDetectorRef.detectChanges();
  }
}
