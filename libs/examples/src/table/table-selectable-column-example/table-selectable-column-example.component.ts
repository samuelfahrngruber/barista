import { AfterViewInit, Component, ViewChild } from '@angular/core';

import {
  DtSelectionChangedEvent,
  DtSort,
  DtTableDataSource,
} from '@dynatrace/barista-components/table';

interface Row {
  host: string;
  cpu: number;
}

@Component({
  selector: 'dt-example-table-selectable-column',
  templateUrl: './table-selectable-column-example.component.html',
  styleUrls: ['./table-selectable-column-example.component.css'],
})
export class DtExampleTableSelectableColumnComponent implements AfterViewInit {
  data: Row[] = [
    {
      host: 'et-demo-2-win4',
      cpu: 30,
    },
    {
      host: 'et-demo-2-win3',
      cpu: 26,
    },
    {
      host: 'docker-host2',
      cpu: 25.4,
    },
    {
      host: 'et-demo-2-win1',
      cpu: 23,
    },
    {
      host: 'et-demo-2-win5',
      cpu: 23,
    },
    {
      host: 'et-demo-2-win6',
      cpu: 23,
    },
    {
      host: 'et-demo-2-win7',
      cpu: 23,
    },
    {
      host: 'et-demo-2-win8',
      cpu: 23,
    },
  ];

  currentSelection: string[] = [];

  // Get the viewChild to pass the sorter reference to the datasource.
  @ViewChild('sortable', { read: DtSort, static: true }) sortable: DtSort;

  // Initialize the table's data source
  dataSource: DtTableDataSource<object>;
  constructor() {
    this.dataSource = new DtTableDataSource(this.data);
  }

  ngAfterViewInit(): void {
    // Set the dtSort reference on the dataSource, so it can react to sorting.
    this.dataSource.sort = this.sortable;
  }

  rowSelectionChanged(event: DtSelectionChangedEvent<Row>): void {
    this.currentSelection = event.selection.map(row => row.host);
  }
}
