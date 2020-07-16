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
  TemplateResult,
  html,
  property,
  CSSResult,
  css,
  unsafeCSS,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { FluidSwitchChangeEvent } from './switch-events';

import {
  FLUID_SPACING_3X_SMALL,
  fluidDtText,
} from '@dynatrace/fluid-design-tokens';

let uniqueCounter = 0;

export class FluidSwitch extends LitElement {
  /**
   * Unique identifier used for the id and label connection
   * within the checkbox.
   */
  private _unique = `fluid-switch-${uniqueCounter++}`;

  /** Reference to the native input within the shadowed template. */
  private _inputElement: HTMLInputElement;

  /** Styles for the button component */
  static get styles(): CSSResult {
    return css`
      :host {
        /**
        * Legibility definitions should probably be
        * shipped or imported from a core
        */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        --fluid-switch--label-color: var(--color-neutral-150);
        --fluid-switch--fill: var(--color-background);
        --fluid-switch--container: var(--color-maxcontrast);
        --fluid-switch--container-fill-checked: var(--color-primary-100);
        --fluid-switch--knob-checked: var(--color-background);
        --fluid-switch--knob: var(--color-maxcontrast);
        --fluid-switch--focus: var(--color-maxcontrast);
      }
      :host([disabled]) {
        pointer-events: none;
      }
      :host([disabled]) .fluid-switch > * {
        opacity: 0.5;
      }
      .fluid-switch {
        display: flex;
        position: relative;
      }
      :host([disabled]) .fluid-switch-input, /* Checkbox should be hidden in the disabled state as well. */
      .fluid-switch-input {
        position: absolute;
        width: 35px;
        height: 20px;
        top: 7px;
        left: 6px;
        opacity: 0;
        cursor: pointer;
      }
      .fluid-switch-input:hover ~ .fluid-switch-label .fluid-switch-glow {
        opacity: 0.1;
      }
      .fluid-svg-switch:active {
        outline: none; /* This is needed to prevent the outline around the switch on click. */
      }
      .fluid-svg-switch.checked .fluid-switch-knob {
        transform: translateX(16px);
        transition: transform 0.3s;
      }
      .fluid-svg-switch.checked .fluid-switch-fill {
        fill: var(--fluid-switch--container-fill-checked);
      }
      .fluid-svg-switch.checked .fluid-switch-knob {
        fill: var(--fluid-switch--knob-checked);
      }
      .fluid-svg-switch.checked .fluid-switch-container {
        stroke: var(--fluid-switch--container-fill-checked);
      }
      .fluid-svg-switch.checked:hover .fluid-switch-glow {
        opacity: 0.1;
      }
      .fluid-svg-switch.checked .fluid-switch-glow {
        transition: transform 0.3s;
        transform: translateX(16px);
      }
      .fluid-svg-switch {
        cursor: pointer;
      }
      .fluid-svg-switch .fluid-switch-knob {
        transition: transform 0.3s;
      }
      .fluid-svg-switch .fluid-switch-fill {
        fill: var(--fluid-switch--fill);
      }
      .fluid-svg-switch .fluid-switch-knob {
        fill: var(--fluid-switch--knob);
      }
      .fluid-svg-switch .fluid-switch-container {
        stroke: var(--fluid-switch--container);
      }
      .fluid-svg-switch:hover .fluid-switch-glow {
        opacity: 0.1;
      }
      .fluid-switch-glow {
        opacity: 0;
        fill: var(--fluid-switch--focus);
      }
      .fluid-svg-switch .fluid-switch-glow {
        transition: transform 0.3s;
      }
      .fluid-label {
        ${unsafeCSS(fluidDtText())};
        display: inline-flex;
        margin-left: ${unsafeCSS(FLUID_SPACING_3X_SMALL)};
        color: var(--fluid-switch--label-color);
      }
      .fluid-switch-label:hover .fluid-switch-glow {
        opacity: 0.1;
      }

      label {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
      }
      label:hover .fluid-knob--hover {
        opacity: 0.1;
        transform: scale(1);
      }
    `;
  }

  /** Whether the switch is disabled or not */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Whether the switch is active or not */
  @property({ type: Boolean, reflect: true })
  set checked(value: boolean) {
    const oldValue = this.checked;
    this._checked = value;
    this.requestUpdate('checked', oldValue);
  }
  get checked(): boolean {
    return this._checked;
  }
  private _checked = false;

  /** First updated lifecycle */
  firstUpdated(props: Map<string | number | symbol, unknown>): void {
    super.firstUpdated(props);
    this._inputElement = this.shadowRoot?.querySelector('input')!;
  }

  /**
   * Render function.
   */
  render(): TemplateResult {
    const svgClassMapData = {
      checked: this.checked,
      'fluid-svg-switch': true,
    };

    return html`<div class="fluid-switch">
      <input
        id="${this._unique}"
        class="fluid-switch-input"
        tabindex="-1"
        focusable="false"
        type="checkbox"
        ?checked="${this.checked}"
        ?disabled="${this.disabled}"
        @change="${this._handleInputChange}"
      />
      <label for="${this._unique}" class="fluid-switch-label">
        <svg
          class="${classMap(svgClassMapData)}"
          tabindex="${this.disabled ? -1 : 0}"
          @keydown="${this._handleKeyDown}"
          @keyup="${this._handleKeyUp}"
          width="55"
          height="40"
          viewBox="-10 -10 55 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            class="fluid-switch-fill"
            x="0.5"
            y="0.5"
            width="35"
            height="19"
            rx="9.5"
          />
          <rect
            class="fluid-switch-container"
            x="0.5"
            y="0.5"
            width="35"
            height="19"
            rx="9.5"
          />
          <circle class="fluid-switch-knob" cx="10" cy="10" r="7" />
          <circle class="fluid-switch-glow" cx="10" cy="10" r="18" />
        </svg>
        <span class="fluid-label">
          <slot></slot>
        </span>
      </label>
    </div>`;
  }

  /**
   * Dispatches a change event for the checkbox
   */
  private _dispatchChangeEvent(): void {
    this.dispatchEvent(new FluidSwitchChangeEvent(this.checked));
  }

  /**
   * Handles the change of the native checkbox element and routes the
   * event out.
   */
  private _handleInputChange(event: Event): void {
    this.checked = (event.target as HTMLInputElement).checked;
    this._dispatchChangeEvent();
  }

  /**
   * Handling the key down event on the svg.
   * @param event
   */
  private _handleKeyDown(event: KeyboardEvent): void {
    if (event.keyCode === 32) {
      event.preventDefault();
    }
  }

  /**
   * Handling the key up event on the svg.
   */
  private _handleKeyUp(event: KeyboardEvent): void {
    if (event.keyCode === 32) {
      this._inputElement.click();
    }
  }

  /** Toggle the checked state */
  toggle(): void {
    this.checked = !this.checked;
  }
}

if (!customElements.get('fluid-switch')) {
  customElements.define('fluid-switch', FluidSwitch);
}
