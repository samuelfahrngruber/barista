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
import { Component } from '@angular/core';
import { DtTableModule } from '@dynatrace/barista-components/table';
import { CommonModule } from '@angular/common';
import { DtIconModule } from '@dynatrace/barista-components/icon';
import { DtLoadingDistractorModule } from '@dynatrace/barista-components/loading-distractor';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DtFormattersModule } from '@dynatrace/barista-components/formatters';
import { HttpClientTestingModule } from '@angular/common/http/testing';

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
});

@Component({
  selector: 'dt-test-table-selectable-column',
  template:
    '<dt-table [dataSource]="dataSource" dtSort>' +
    '<dt-checkbox-column name="select"></dt-checkbox-column>' +
    '<dt-simple-text-column name="host"></dt-simple-text-column>' +
    "<dt-header-row *dtHeaderRowDef=\"['select', 'host']\"></dt-header-row>" +
    "<dt-row *dtRowDef=\"let row; columns: ['select', 'host']\"></dt-row> </dt-table>",
})
class DtCheckboxColumnComponentForTesting {
  dataSource = [
    { host: 'host1' },
    { host: 'host2' },
    { host: 'host3' },
    { host: 'host4' },
  ];
}
