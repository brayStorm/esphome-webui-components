import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { haTheme, haCommonStyles } from "./ha-theme.js";

export type ButtonVariant = "primary" | "secondary" | "text" | "warning" | "danger";

@customElement("esphome-button")
export class ESPHomeButton extends LitElement {
  @property() public label = "";
  @property() public variant: ButtonVariant = "secondary";
  @property({ type: Boolean }) public disabled = false;
  @property({ type: Boolean }) public dense = false;
  @property({ type: Boolean }) public noWrap = false;
  @property() public icon?: string;
  @property() public iconTrailing?: string;

  protected render() {
    return html`
      <button
        class=${classMap({
          [this.variant]: true,
          dense: this.dense,
        })}
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        ${this.icon
          ? html`<ha-svg-icon class="icon" .path=${this.icon}></ha-svg-icon>`
          : ""}
        ${this.label ? html`<span class="label">${this.label}</span>` : ""}
        ${this.iconTrailing
          ? html`<ha-svg-icon class="icon trailing" .path=${this.iconTrailing}></ha-svg-icon>`
          : ""}
      </button>
    `;
  }

  private _handleClick(e: Event) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }

  static styles = [haTheme, haCommonStyles, css`
    :host {
      display: inline-block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--esphome-spacing-s);
      padding: 0 var(--esphome-spacing-m);
      min-height: 36px;
      border: none;
      border-radius: var(--mdc-shape-small, 4px);
      font-family: var(--esphome-font-family);
      font-size: var(--esphome-font-size-m);
      font-weight: var(--esphome-font-weight-medium);
      line-height: var(--esphome-line-height-normal);
      text-transform: uppercase;
      letter-spacing: 0.0892857143em;
      cursor: pointer;
      transition: background-color var(--esphome-transition-duration) var(--esphome-transition-timing),
                  box-shadow var(--esphome-transition-duration) var(--esphome-transition-timing);
      white-space: nowrap;
      user-select: none;
      outline: none;
      position: relative;
      overflow: hidden;
      vertical-align: middle;
    }

    button.dense {
      min-height: 32px;
      padding: 0 var(--esphome-spacing-s);
      font-size: var(--esphome-font-size-s);
    }

    button:disabled {
      color: var(--esphome-text-disabled);
      cursor: not-allowed;
      background-color: transparent;
      box-shadow: none;
    }

    .icon {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
    }

    .icon.trailing {
      margin-left: var(--esphome-spacing-xs);
    }

    .label {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ha-svg-icon {
      display: inline-flex;
      --mdc-icon-size: 18px;
    }

    /* Primary variant */
    button.primary {
      background-color: var(--esphome-primary-color);
      color: var(--text-primary-color, white);
      box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
                  0px 2px 2px 0px rgba(0, 0, 0, 0.14),
                  0px 1px 5px 0px rgba(0, 0, 0, 0.12);
    }

    button.primary:hover:not(:disabled) {
      box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2),
                  0px 4px 5px 0px rgba(0, 0, 0, 0.14),
                  0px 1px 10px 0px rgba(0, 0, 0, 0.12);
    }

    button.primary:active:not(:disabled) {
      box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0px 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0px 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    button.primary:disabled {
      background-color: var(--esphome-border-color);
      color: var(--esphome-text-disabled);
    }

    /* Secondary variant (outlined) */
    button.secondary {
      background-color: transparent;
      color: var(--esphome-primary-color);
      border: 1px solid var(--esphome-border-color);
      padding: 0 calc(var(--esphome-spacing-m) - 1px);
    }

    button.secondary:hover:not(:disabled) {
      background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.04);
    }

    button.secondary:active:not(:disabled) {
      background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    }

    button.secondary:disabled {
      border-color: var(--esphome-text-disabled);
    }

    /* Text variant */
    button.text {
      background-color: transparent;
      color: var(--esphome-primary-color);
      box-shadow: none;
      padding: 0 var(--esphome-spacing-s);
    }

    button.text:hover:not(:disabled) {
      background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.04);
    }

    button.text:active:not(:disabled) {
      background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    }

    /* Warning variant */
    button.warning {
      background-color: var(--esphome-warning-color);
      color: var(--text-primary-color, white);
      box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
                  0px 2px 2px 0px rgba(0, 0, 0, 0.14),
                  0px 1px 5px 0px rgba(0, 0, 0, 0.12);
    }

    button.warning:hover:not(:disabled) {
      box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2),
                  0px 4px 5px 0px rgba(0, 0, 0, 0.14),
                  0px 1px 10px 0px rgba(0, 0, 0, 0.12);
    }

    button.warning:disabled {
      background-color: var(--esphome-border-color);
      color: var(--esphome-text-disabled);
    }

    /* Danger variant */
    button.danger {
      background-color: var(--esphome-error-color);
      color: var(--text-primary-color, white);
      box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
                  0px 2px 2px 0px rgba(0, 0, 0, 0.14),
                  0px 1px 5px 0px rgba(0, 0, 0, 0.12);
    }

    button.danger:hover:not(:disabled) {
      box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2),
                  0px 4px 5px 0px rgba(0, 0, 0, 0.14),
                  0px 1px 10px 0px rgba(0, 0, 0, 0.12);
    }

    button.danger:disabled {
      background-color: var(--esphome-border-color);
      color: var(--esphome-text-disabled);
    }

    /* Focus styles */
    button:focus-visible {
      outline: 2px solid var(--esphome-focus-color);
      outline-offset: 2px;
    }

    /* Ripple effect */
    button::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: currentColor;
      opacity: 0;
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s, opacity 0.6s;
    }

    button:active::before {
      width: 200%;
      height: 200%;
      opacity: 0.1;
    }

    /* Responsive */
    @media (max-width: 768px) {
      button {
        min-height: 48px;
      }
      
      button.dense {
        min-height: 36px;
      }
    }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "esphome-button": ESPHomeButton;
  }
}
