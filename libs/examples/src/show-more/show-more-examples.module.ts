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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DtExampleShowMoreDefault } from './show-more-default-example/show-more-default-example';
import { DtExampleShowMoreDisabled } from './show-more-disabled-example/show-more-disabled-example';
import { DtExampleShowMoreDark } from './show-more-dark-example/show-more-dark-example';
import { DtExampleShowMoreToggle } from './show-more-toggle-example/show-more-toggle-example';
import { DtShowMoreModule } from '@dynatrace/barista-components/show-more';
import { DtButtonModule } from '@dynatrace/barista-components/button';
import { DtExpandablePanelModule } from '@dynatrace/barista-components/expandable-panel';
import { DtThemingModule } from '@dynatrace/barista-components/theming';

const DT_SHOW_MORE_EXAMPLES = [
  DtExampleShowMoreDefault,
  DtExampleShowMoreDisabled,
  DtExampleShowMoreDark,
  DtExampleShowMoreToggle,
];
@NgModule({
  imports: [
    CommonModule,
    DtShowMoreModule,
    DtButtonModule,
    DtExpandablePanelModule,
    DtThemingModule,
  ],
  declarations: DT_SHOW_MORE_EXAMPLES,
})
export class DtExamplesShowMoreModule {}
