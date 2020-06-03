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

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { DtTableModule } from '@dynatrace/barista-components/table';
import { CommonModule } from '@angular/common';
import { DtIconModule } from '@dynatrace/barista-components/icon';
import { DtLoadingDistractorModule } from '@dynatrace/barista-components/loading-distractor';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DtFormattersModule } from '@dynatrace/barista-components/formatters';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import {
  DtCheckbox,
  DtCheckboxChange,
} from '@dynatrace/barista-components/checkbox';
import {
  DtCheckboxColumn,
  DtCheckboxColumnDisplayAccessor,
} from './checkbox-column';
import { isNil } from 'lodash-es';

describe('DtCheckboxColumn', () => {
  let component: DtCheckboxColumnComponentForTesting;
  let fixture: ComponentFixture<DtCheckboxColumnComponentForTesting>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        DtTableModule,
        DtIconModule.forRoot({ svgIconLocation: `{{name}}.svg` }),
        DtLoadingDistractorModule,
        NoopAnimationsModule,
        DtFormattersModule,
        HttpClientTestingModule,
      ],
      declarations: [DtCheckboxColumnComponentForTesting],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DtCheckboxColumnComponentForTesting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('dt-row'));
    expect(rows.length).toBe(4);
  });

  it('should unchecked checkboxes for the header and every row', () => {
    const rowCheckboxes = fixture.debugElement.queryAll(
      By.css('dt-row dt-checkbox'),
    );
    const headerCheckbox = fixture.debugElement.queryAll(
      By.css('dt-header-row dt-checkbox'),
    );
    expect(rowCheckboxes.length).toBe(4);
    expect(headerCheckbox.length).toBe(1);
  });

  it('should render checkboxes in the correct state', () => {
    const rowCheckboxes = fixture.debugElement.queryAll(
      By.css('dt-row dt-checkbox'),
    );

    const defaultRow: DtCheckbox<any> = rowCheckboxes[0].componentInstance;
    expect(defaultRow.checked).toBe(false);
    expect(defaultRow.indeterminate).toBe(false);
    expect(defaultRow.disabled).toBe(false);

    const indeterminateRow: DtCheckbox<any> =
      rowCheckboxes[1].componentInstance;
    expect(indeterminateRow.checked).toBe(false);
    expect(indeterminateRow.indeterminate).toBe(true);
    expect(indeterminateRow.disabled).toBe(false);

    const disabledRow: DtCheckbox<any> = rowCheckboxes[2].componentInstance;
    expect(disabledRow.checked).toBe(false);
    expect(disabledRow.indeterminate).toBe(false);
    expect(disabledRow.disabled).toBe(true);

    const checkedRow: DtCheckbox<any> = rowCheckboxes[3].componentInstance;
    expect(checkedRow.checked).toBe(true);
    expect(checkedRow.indeterminate).toBe(false);
    expect(checkedRow.disabled).toBe(false);
  });

  it('should toggle the checkbox', () => {
    const checkbox = fixture.debugElement.query(By.css('dt-row dt-checkbox'));

    const defaultRow: DtCheckbox<any> = checkbox.componentInstance;
    expect(defaultRow.checked).toBe(false);
    expect(defaultRow.indeterminate).toBe(false);
    expect(defaultRow.disabled).toBe(false);

    defaultRow._onInputClick(new Event('click'));
    fixture.detectChanges();

    const updatedCheckbox = fixture.debugElement.query(
      By.css('dt-row dt-checkbox'),
    );
    const updatedRow: DtCheckbox<any> = updatedCheckbox.componentInstance;
    expect(updatedRow.checked).toBe(true);
    expect(updatedRow.indeterminate).toBe(false);
    expect(updatedRow.disabled).toBe(false);

    updatedRow._onInputClick(new Event('click'));
    fixture.detectChanges();

    const deselectedRow: DtCheckbox<any> = fixture.debugElement.query(
      By.css('dt-row dt-checkbox'),
    ).componentInstance;
    expect(deselectedRow.checked).toBe(false);
    expect(deselectedRow.indeterminate).toBe(false);
    expect(deselectedRow.disabled).toBe(false);
  });

  it('should toggle all rows', () => {
    const headerCheckbox: DtCheckbox<any> = fixture.debugElement.query(
      By.css('dt-header-row dt-checkbox'),
    ).componentInstance;

    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox.indeterminate).toBe(false);
    expect(headerCheckbox.disabled).toBe(false);

    headerCheckbox._onInputClick(new Event('click'));
    fixture.detectChanges();

    expect(headerCheckbox.checked).toBe(true);
    expect(headerCheckbox.indeterminate).toBe(false);
    expect(headerCheckbox.disabled).toBe(false);
    let rows = fixture.debugElement.queryAll(By.css('dt-row dt-checkbox'));
    rows.forEach((row) => {
      const checkbox: DtCheckbox<any> = row.componentInstance;
      expect(checkbox.checked).toBe(true);
    });

    headerCheckbox._onInputClick(new Event('click'));
    fixture.detectChanges();
    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox.indeterminate).toBe(false);
    expect(headerCheckbox.disabled).toBe(false);
    rows = fixture.debugElement.queryAll(By.css('dt-row dt-checkbox'));
    rows.forEach((row) => {
      const checkbox: DtCheckbox<any> = row.componentInstance;
      expect(checkbox.checked).toBe(false);
    });
  });

  it('should show the header checkbox in the correct state', () => {
    const headerCheckbox: DtCheckbox<any> = fixture.debugElement.query(
      By.css('dt-header-row dt-checkbox'),
    ).componentInstance;

    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox.indeterminate).toBe(false);
    expect(headerCheckbox.disabled).toBe(false);

    component.checkboxColumn.anySelected = true;
    fixture.detectChanges();

    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox.indeterminate).toBe(true);
    expect(headerCheckbox.disabled).toBe(false);

    component.checkboxColumn.allSelected = true;
    fixture.detectChanges();

    expect(headerCheckbox.checked).toBe(true);
    expect(headerCheckbox.indeterminate).toBe(false);
    expect(headerCheckbox.disabled).toBe(false);
  });
});

describe('DtCheckboxColumnWithDisplayAccessor', () => {
  let fixture: ComponentFixture<DtCheckboxColumnComponentForTestingWithDisplayAccessor>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        DtTableModule,
        DtIconModule.forRoot({ svgIconLocation: `{{name}}.svg` }),
        DtLoadingDistractorModule,
        NoopAnimationsModule,
        DtFormattersModule,
        HttpClientTestingModule,
      ],
      declarations: [DtCheckboxColumnComponentForTestingWithDisplayAccessor],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(
      DtCheckboxColumnComponentForTestingWithDisplayAccessor,
    );
    fixture.detectChanges();
  });

  it('should render checkboxes in the correct state', () => {
    const rowCheckboxes = fixture.debugElement.queryAll(
      By.css('dt-row dt-checkbox'),
    );

    const defaultRow: DtCheckbox<any> = rowCheckboxes[0].componentInstance;
    expect(defaultRow.checked).toBe(false);
    expect(defaultRow.indeterminate).toBe(false);
    expect(defaultRow.disabled).toBe(false);

    const indeterminateRow: DtCheckbox<any> =
      rowCheckboxes[1].componentInstance;
    expect(indeterminateRow.checked).toBe(false);
    expect(indeterminateRow.indeterminate).toBe(true);
    expect(indeterminateRow.disabled).toBe(false);

    const disabledRow: DtCheckbox<any> = rowCheckboxes[2].componentInstance;
    expect(disabledRow.checked).toBe(false);
    expect(disabledRow.indeterminate).toBe(false);
    expect(disabledRow.disabled).toBe(true);

    const checkedRow: DtCheckbox<any> = rowCheckboxes[3].componentInstance;
    expect(checkedRow.checked).toBe(true);
    expect(checkedRow.indeterminate).toBe(false);
    expect(checkedRow.disabled).toBe(false);
  });

  it('should use fallback values if display accessor does not specify specific values', () => {
    fixture.componentInstance.checkboxColumn.displayAccessor = () => {
      return {};
    };
    fixture.detectChanges();
    const rowCheckboxes = fixture.debugElement.queryAll(
      By.css('dt-row dt-checkbox'),
    );

    const defaultRow: DtCheckbox<any> = rowCheckboxes[0].componentInstance;
    expect(defaultRow.checked).toBe(false);
    expect(defaultRow.indeterminate).toBe(false);
    expect(defaultRow.disabled).toBe(false);

    const indeterminateRow: DtCheckbox<any> =
      rowCheckboxes[1].componentInstance;
    expect(indeterminateRow.checked).toBe(false);
    expect(indeterminateRow.indeterminate).toBe(false);
    expect(indeterminateRow.disabled).toBe(false);

    const disabledRow: DtCheckbox<any> = rowCheckboxes[2].componentInstance;
    expect(disabledRow.checked).toBe(false);
    expect(disabledRow.indeterminate).toBe(false);
    expect(disabledRow.disabled).toBe(false);

    const checkedRow: DtCheckbox<any> = rowCheckboxes[3].componentInstance;
    expect(checkedRow.checked).toBe(false);
    expect(checkedRow.indeterminate).toBe(false);
    expect(checkedRow.disabled).toBe(false);
  });
});

@Component({
  selector: 'dt-test-table-selectable-column',
  template:
    '<dt-table [dataSource]="dataSource" dtSort>' +
    '<dt-checkbox-column name="select" (selectionToggled)="toggleRow($event)" (checkboxHeaderChanged)="toggleAll($event)"></dt-checkbox-column>' +
    '<dt-simple-text-column name="host"></dt-simple-text-column>' +
    "<dt-header-row *dtHeaderRowDef=\"['select', 'host']\"></dt-header-row>" +
    "<dt-row *dtRowDef=\"let row; columns: ['select', 'host']\"></dt-row> </dt-table>",
})
class DtCheckboxColumnComponentForTesting {
  @ViewChild(DtCheckboxColumn, { static: true, read: DtCheckboxColumn })
  checkboxColumn: DtCheckboxColumn<any>;

  dataSource = [
    { host: 'host1' },
    {
      host: 'host2',
      select: {
        indeterminate: true,
      },
    },
    {
      host: 'host3',
      select: {
        disabled: true,
      },
    },
    {
      host: 'host4',
      select: {
        checked: true,
      },
    },
  ];

  toggleRow(row: any): void {
    if (!isNil(row)) {
      this.toggleSingleRow(row);
    }
  }

  toggleAll(event: DtCheckboxChange<any>): void {
    this.dataSource.forEach((row) => {
      row.select = {
        checked: event.checked,
      };
    });
  }

  toggleSingleRow(row: any): void {
    if (isNil(row.select)) {
      row.select = {
        checked: false,
      };
    }
    row.select.checked = !row.select.checked;
  }
}

interface Row {
  host: string;
}

@Component({
  selector: 'dt-test-table-selectable-column-with-accessor',
  template:
    '<dt-table [dataSource]="dataSource" dtSort>' +
    '<dt-checkbox-column name="select" [displayAccessor]="displayAccessor"></dt-checkbox-column>' +
    '<dt-simple-text-column name="host"></dt-simple-text-column>' +
    "<dt-header-row *dtHeaderRowDef=\"['select', 'host']\"></dt-header-row>" +
    "<dt-row *dtRowDef=\"let row; columns: ['select', 'host']\"></dt-row> </dt-table>",
})
class DtCheckboxColumnComponentForTestingWithDisplayAccessor {
  @ViewChild(DtCheckboxColumn, { static: true, read: DtCheckboxColumn })
  checkboxColumn: DtCheckboxColumn<any>;

  dataSource: Row[] = [
    {
      host: 'host1',
    },
    {
      host: 'host2',
    },
    {
      host: 'host3',
    },
    {
      host: 'host4',
    },
  ];

  displayAccessor = (value: Row): DtCheckboxColumnDisplayAccessor => {
    const checked = value.host === 'host4';
    const indeterminate = value.host === 'host2';
    const disabled = value.host === 'host3';
    return {
      checked: checked,
      indeterminate: indeterminate,
      disabled: disabled,
    };
  };
}
