import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

export type ButtonVariant = "primary" | "secondary" | "text";

@customElement("esphome-button")
export class ESPHomeButton extends LitElement {
  @property() public label = "";
  @property() public variant: ButtonVariant = "secondary";
  @property({ type: Boolean }) public disabled = false;
  @property({ type: Boolean }) public dense = false;
  @property() public icon?: string;

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
          ? html`<svg class="icon" width="16" height="16" viewBox="0 0 24 24">
              <path d=${this.icon} fill="currentColor" />
            </svg>`
          : ""}
        <span>${this.label}</span>
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

  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 16px;
      border: 1px solid transparent;
      border-radius: var(--esphome-border-radius, 4px);
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      line-height: 1;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      user-select: none;
      outline: none;
    }

    button.dense {
      padding: 6px 12px;
      font-size: 13px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .icon {
      flex-shrink: 0;
    }

    /* Primary variant */
    button.primary {
      background-color: var(--esphome-primary-color, #03a9f4);
      color: var(--esphome-primary-text, #ffffff);
      border-color: var(--esphome-primary-color, #03a9f4);
    }

    button.primary:hover:not(:disabled) {
      background-color: var(--esphome-primary-hover, #039be5);
      border-color: var(--esphome-primary-hover, #039be5);
    }

    button.primary:active:not(:disabled) {
      background-color: var(--esphome-primary-active, #0288d1);
      border-color: var(--esphome-primary-active, #0288d1);
    }

    /* Secondary variant */
    button.secondary {
      background-color: transparent;
      color: var(--esphome-text-primary, #212121);
      border-color: var(--esphome-border-color, #e0e0e0);
    }

    button.secondary:hover:not(:disabled) {
      background-color: var(--esphome-hover-background, rgba(0, 0, 0, 0.04));
      border-color: var(--esphome-border-hover, #bdbdbd);
    }

    button.secondary:active:not(:disabled) {
      background-color: var(--esphome-active-background, rgba(0, 0, 0, 0.08));
    }

    /* Text variant */
    button.text {
      background-color: transparent;
      color: var(--esphome-primary-color, #03a9f4);
      border-color: transparent;
      padding: 8px 12px;
    }

    button.text:hover:not(:disabled) {
      background-color: var(--esphome-hover-background, rgba(3, 169, 244, 0.08));
    }

    button.text:active:not(:disabled) {
      background-color: var(--esphome-active-background, rgba(3, 169, 244, 0.16));
    }

    /* Focus styles */
    button:focus-visible {
      box-shadow: 0 0 0 2px var(--esphome-focus-color, rgba(3, 169, 244, 0.4));
    }

    /* Dark mode adjustments */
    @media (prefers-color-scheme: dark) {
      button.secondary {
        color: var(--esphome-text-primary, #e0e0e0);
        border-color: var(--esphome-border-color, #404040);
      }

      button.secondary:hover:not(:disabled) {
        background-color: var(--esphome-hover-background, rgba(255, 255, 255, 0.08));
        border-color: var(--esphome-border-hover, #606060);
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "esphome-button": ESPHomeButton;
  }
}
