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

import {
  LitElement,
  CSSResult,
  TemplateResult,
  html,
  property,
} from 'lit-element';
import styles from './tab-group.scss';
import { FluidTab } from './tab/tab';
import {
  FluidTabActivatedEvent,
  FluidTabDisabledEvent,
  FluidTabGroupActiveTabChanged,
} from '../utils/tab-events';
import {
  ENTER,
  SPACE,
  ARROW_RIGHT,
  ARROW_LEFT,
  TAB,
} from '@dynatrace/shared/keycodes';

/**
 * This is a experimental version of the tab group component
 * It registers itself as `fluid-tab-group` custom element.
 * @element fluid-tag-group
 * @slot - Default slot lets the user provide a group of fluid-tabs.
 */
export class FluidTabGroup extends LitElement {
  /** Array of referrences to the fluid-tabs */
  private tabChildren: FluidTab[];

  /** Styles for the tab list component */
  static get styles(): CSSResult {
    return styles;
  }

  /**
   * Defines a tab to be active
   * @attr
   * @type string
   */
  @property({ type: String, reflect: true })
  activeTabId: string;

  /** Contains the tab id that will be activated when the user presses SPACEBAR */
  private _toBeActiveTab: string;

  /** Sets the active tab on click */
  private handleClick(event: FluidTabActivatedEvent): void {
    if (this.activeTabId != event.activeTab) {
      for (const tab of this.tabChildren) {
        tab.tabindex = -1;
      }
      this.activeTabId = event.activeTab;
      const tab = this.tabChildren.find(
        (tab) => tab.tabid === this.activeTabId,
      )!;
      tab.active = true;
      tab.tabindex = 0;
      this.dispatchEvent(new FluidTabGroupActiveTabChanged(this.activeTabId));
    }
  }

  /** Sets the active tab on keydown (ArrowLeft and ArrowRight to select / Enter and Space to confirm) */
  private handleKeyUp(event: KeyboardEvent): void {
    // Sets the focus outline when user tabbed into the fluid element
    if (event.code === TAB) {
      const tabbed = this.tabChildren.find((tab) => {
        return tab.tabindex === 0;
      });
      tabbed!.tabbed = true;
    }
    // Enter Space controll (validate selection). Selects the tab that was previously focused using tab/arrowkeys
    if (event.code === ENTER || event.code === SPACE) {
      // Set all tabs to active false
      for (const tab of this.tabChildren) {
        tab.active = false;
      }

      // Find the tab to be activated
      const activeTab = this.tabChildren.find((tab) => {
        return this._toBeActiveTab === tab.tabid;
      })!;

      activeTab.active = true;
      this.activeTabId = activeTab.tabid;
      this._toBeActiveTab = this.activeTabId;
      this.dispatchEvent(new FluidTabGroupActiveTabChanged(this.activeTabId));
    }
    // Arrow control (navigate tabs)
    if (event.code === ARROW_RIGHT || event.code === ARROW_LEFT) {
      // Loops over to find
      if (!this._toBeActiveTab) {
        this._toBeActiveTab = this.activeTabId;
      }

      let index = this.tabChildren.findIndex(
        (tab: FluidTab) => this._toBeActiveTab === tab.tabid,
      );

      const oldIndex = index;
      if (event.code === ARROW_RIGHT) {
        index += 1;
      }
      if (event.code === ARROW_LEFT) {
        index -= 1;
      }
      if (index > this.tabChildren.length - 1) {
        index = 0;
      } else if (index < 0) {
        index = this.tabChildren.length - 1;
      }

      this.tabChildren[index].tabbed = true;
      this.tabChildren[index].focusTab();
      this._toBeActiveTab = this.tabChildren[index].tabid;

      this.tabChildren[oldIndex].tabbed = false;
    }
  }

  /** In order to prevent the browser to scroll when the user selects a tab using the spacebar we prevent the default behavior. */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.code === SPACE) {
      event.preventDefault();
    }
  }

  /** Checks whether the next tab is also disabled or not and sets the next not disabled tab as active  */
  private handleDisabled(disableTabEvent: FluidTabDisabledEvent): void {
    if (this.activeTabId === disableTabEvent.disableTab) {
      this.setFirstEnabledTabActive();
    }
  }

  /** Handles changes in the slot. Initially sets the active item (default is first) */
  private slotchange(): void {
    let tabChildrenLength;
    if (this.tabChildren !== undefined) {
      tabChildrenLength = this.tabChildren.length;
    }
    this.tabChildren = Array.from(this.querySelectorAll('fluid-tab'));
    if (
      !this.tabChildren.find((tab) => tab.tabindex === 0) &&
      tabChildrenLength > this.tabChildren.length
    ) {
      this.setFirstEnabledTabActive();
    }

    // Initially set the first tab to active
    if (!this.activeTabId && this.tabChildren.length > 0) {
      // Also sets tabindex to 0
      this.tabChildren[0].active = true;
      this.activeTabId = this.tabChildren[0].tabid;
      // Needs to be set initially
      this._toBeActiveTab = this.activeTabId;
    } else {
      for (const tab of this.tabChildren) {
        tab.active = tab.tabid === this.activeTabId;
      }
    }
  }

  /**
   * Render function of the custom element. It is called when one of the
   * observedProperties (annotated with @property) changes.
   */
  render(): TemplateResult {
    return html`
      <div
        class="fluid-tab-group"
        @tabActivated="${this.handleClick}"
        @keyup="${this.handleKeyUp}"
        @keydown="${this.handleKeyDown}"
        @disabled="${this.handleDisabled}"
      >
        <slot @slotchange="${this.slotchange}"></slot>
      </div>
    `;
  }

  /** Sets a tab to active but only when one of them is enabled */
  setFirstEnabledTabActive(): void {
    const tabToEnable = this.tabChildren.find((tab) => !tab.disabled);
    if (tabToEnable) {
      tabToEnable.active = true;
      this.activeTabId = tabToEnable.tabid;
    }
  }
}

if (!customElements.get('fluid-tab-group')) {
  customElements.define('fluid-tab-group', FluidTabGroup);
}
