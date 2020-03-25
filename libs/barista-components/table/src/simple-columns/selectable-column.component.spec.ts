/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DtSelectableColumnComponent } from './selectable-column.component';
import { Component } from '@angular/core';

describe('DtSelectableColumnComponent', () => {
  let component: DtSelectableColumnForTestingComponent;
  let fixture: ComponentFixture<DtSelectableColumnForTestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DtSelectableColumnComponent],
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
