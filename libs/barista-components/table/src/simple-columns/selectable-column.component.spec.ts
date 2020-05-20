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
import { DtCheckboxColumn } from './selectable-column.component';
import { Component } from '@angular/core';

describe('DtSelectableColumnComponent', () => {
  let component: DtSelectableColumnForTestingComponent;
  let fixture: ComponentFixture<DtSelectableColumnForTestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DtCheckboxColumn],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DtSelectableColumnForTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  selector: 'dt-test-table-selectable-column',
  template:
    '<dt-table [dataSource]="dataSource">' +
    '<dt-selectable-column name="select"></dt-selectable-column>' +
    '<dt-simple-text-column name="host"></dt-simple-text-column>' +
    "<dt-header-row *dtHeaderRowDef=\"['select', 'host']\"></dt-header-row>" +
    "<dt-row *dtRowDef=\"let row; columns: ['select', 'host']\"></dt-row> </dt-table>",
})
class DtSelectableColumnForTestingComponent {
  dataSource = [
    { host: 'host1' },
    { host: 'host2' },
    { host: 'host3' },
    { host: 'host4' },
  ];
}
