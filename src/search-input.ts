import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { haTheme, haCommonStyles } from "./ha-theme.js";
import { debounce } from "./utils.js";

@customElement("search-input")
export class SearchInput extends LitElement {
  @property() public value = "";
  @property() public placeholder = "Search...";
  @property({ type: Boolean }) public disabled = false;
  @property({ type: Boolean }) public narrow = false;
  @property() public label?: string;
  @property({ type: Boolean, attribute: "no-label-float" }) public noLabelFloat = false;
  @state() private _focused = false;

  private _debouncedInput = debounce((value: string) => {
    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value },
        bubbles: true,
        composed: true,
      })
    );
  }, 300);

  private _handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this._debouncedInput(this.value);
  }

  private _handleFocus() {
    this._focused = true;
  }

  private _handleBlur() {
    this._focused = false;
  }

  private _handleClear() {
    this.value = "";
    this._debouncedInput("");
    this.shadowRoot?.querySelector("input")?.focus();
  }

  protected render() {
    const hasValue = this.value.length > 0;
    const shouldFloat = this._focused || hasValue || this.noLabelFloat;

    return html`
      <div class="search-container ${classMap({ 
        focused: this._focused,
        'has-value': hasValue,
        narrow: this.narrow,
        disabled: this.disabled
      })}">
        ${this.label && !this.noLabelFloat ? html`
          <label class="floating-label ${classMap({ float: shouldFloat })}">
            ${this.label}
          </label>
        ` : ""}
        
        <div class="input-container">
          <ha-svg-icon 
            class="search-icon"
            .path="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
          ></ha-svg-icon>
          
          <input
            type="search"
            .value=${this.value}
            .placeholder=${this.noLabelFloat ? this.placeholder : ""}
            ?disabled=${this.disabled}
            @input=${this._handleInput}
            @focus=${this._handleFocus}
            @blur=${this._handleBlur}
            autocomplete="off"
            spellcheck="false"
          />
          
          ${hasValue ? html`
            <button
              class="clear-button"
              type="button"
              @click=${this._handleClear}
              ?disabled=${this.disabled}
              aria-label="Clear search"
            >
              <ha-svg-icon 
                .path="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              ></ha-svg-icon>
            </button>
          ` : ""}
        </div>
      </div>
    `;
  }

  static styles = [haTheme, haCommonStyles, css`
    :host {
      display: block;
      width: 100%;
    }

    .search-container {
      position: relative;
      background: var(--esphome-card-background);
      border: 1px solid var(--esphome-border-color);
      border-radius: var(--esphome-border-radius);
      transition: border-color var(--esphome-transition-duration) var(--esphome-transition-timing),
                  box-shadow var(--esphome-transition-duration) var(--esphome-transition-timing);
    }

    .search-container.focused {
      border-color: var(--esphome-primary-color);
      box-shadow: 0 0 0 1px var(--esphome-primary-color);
    }

    .search-container.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .floating-label {
      position: absolute;
      left: var(--esphome-spacing-l);
      top: 50%;
      transform: translateY(-50%);
      color: var(--esphome-text-secondary);
      font-size: var(--esphome-font-size-m);
      font-weight: var(--esphome-font-weight-normal);
      pointer-events: none;
      transition: all var(--esphome-transition-duration) var(--esphome-transition-timing);
      z-index: 1;
      background: var(--esphome-card-background);
      padding: 0 var(--esphome-spacing-xs);
    }

    .floating-label.float {
      top: 0;
      left: var(--esphome-spacing-s);
      font-size: var(--esphome-font-size-s);
      color: var(--esphome-primary-color);
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
      min-height: 48px;
      padding: 0 var(--esphome-spacing-m);
    }

    .search-container.narrow .input-container {
      min-height: 40px;
      padding: 0 var(--esphome-spacing-s);
    }

    .search-icon {
      width: 20px;
      height: 20px;
      color: var(--esphome-text-secondary);
      margin-right: var(--esphome-spacing-s);
      flex-shrink: 0;
    }

    input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--esphome-font-family);
      font-size: var(--esphome-font-size-m);
      color: var(--esphome-text-primary);
      padding: var(--esphome-spacing-s) 0;
    }

    input::placeholder {
      color: var(--esphome-text-secondary);
      opacity: 1;
    }

    input:disabled {
      cursor: not-allowed;
    }

    /* Remove default search input styling */
    input[type="search"]::-webkit-search-decoration,
    input[type="search"]::-webkit-search-cancel-button,
    input[type="search"]::-webkit-search-results-button,
    input[type="search"]::-webkit-search-results-decoration {
      -webkit-appearance: none;
    }

    .clear-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      color: var(--esphome-text-secondary);
      margin-left: var(--esphome-spacing-xs);
      transition: background-color var(--esphome-transition-duration) var(--esphome-transition-timing);
      flex-shrink: 0;
    }

    .clear-button:hover:not(:disabled) {
      background-color: var(--esphome-hover-background);
    }

    .clear-button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .clear-button ha-svg-icon {
      width: 16px;
      height: 16px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .input-container {
        min-height: 44px;
      }
      
      .search-container.narrow .input-container {
        min-height: 36px;
      }
    }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "search-input": SearchInput;
  }
}