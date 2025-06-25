import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { haTheme, haCommonStyles } from "./ha-theme.js";

export interface MenuItem {
  label: string;
  icon?: string;
  action: string;
  divider?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  warning?: boolean;
}

@customElement("esphome-action-menu")
export class ESPHomeActionMenu extends LitElement {
  @property({ attribute: false }) public items: MenuItem[] = [];
  @property({ type: Boolean }) public corner = false;
  @property() public placement: "bottom" | "top" | "left" | "right" = "bottom";
  @state() private _open = false;

  private _toggleMenu(e: Event) {
    e.stopPropagation();
    this._open = !this._open;
  }

  private _handleItemClick(item: MenuItem, e: Event) {
    e.stopPropagation();
    if (item.divider || item.disabled) return;

    this._open = false;
    this.dispatchEvent(
      new CustomEvent("action", {
        detail: { action: item.action },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleClickOutside = (e: Event) => {
    if (!this.contains(e.target as Node)) {
      this._open = false;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._handleClickOutside);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._handleClickOutside);
  }

  protected render() {
    return html`
      <div class="menu-container">
        <button
          class="menu-trigger ${classMap({ corner: this.corner })}"
          @click=${this._toggleMenu}
          aria-label="More actions"
          aria-expanded=${this._open}
          aria-haspopup="true"
        >
          <ha-svg-icon
            .path="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
          ></ha-svg-icon>
        </button>

        ${this._open
          ? html`
              <div class="menu-dropdown ${this.placement}" role="menu">
                ${this.items.map(
                  (item) =>
                    item.divider
                      ? html`<div class="menu-divider" role="separator"></div>`
                      : html`
                          <button
                            class=${classMap({
                              "menu-item": true,
                              destructive: !!item.destructive,
                              warning: !!item.warning,
                              disabled: !!item.disabled,
                            })}
                            role="menuitem"
                            ?disabled=${item.disabled}
                            @click=${(e: Event) => this._handleItemClick(item, e)}
                          >
                            ${item.icon
                              ? html`
                                  <ha-svg-icon
                                    class="menu-icon"
                                    .path=${item.icon}
                                  ></ha-svg-icon>
                                `
                              : nothing}
                            <span class="menu-label">${item.label}</span>
                          </button>
                        `
                )}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  static styles = [haTheme, haCommonStyles, css`
    :host {
      display: inline-block;
      position: relative;
    }

    .menu-container {
      position: relative;
    }

    .menu-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--esphome-text-secondary);
      border-radius: 50%;
      cursor: pointer;
      transition: background-color var(--esphome-transition-duration) var(--esphome-transition-timing);
      position: relative;
    }

    .menu-trigger.corner {
      width: 36px;
      height: 36px;
    }

    .menu-trigger ha-svg-icon {
      --mdc-icon-size: 24px;
    }

    .menu-trigger:hover {
      background-color: var(--esphome-hover-background);
    }

    .menu-trigger:focus-visible {
      outline: 2px solid var(--esphome-focus-color);
      outline-offset: 2px;
    }

    .menu-dropdown {
      position: absolute;
      min-width: 192px;
      max-width: 280px;
      background: var(--esphome-card-background);
      border-radius: var(--mdc-shape-medium, 4px);
      box-shadow: var(--esphome-menu-shadow);
      z-index: var(--esphome-z-index-dropdown);
      overflow: hidden;
      animation: slideIn var(--esphome-transition-duration) var(--esphome-transition-timing);
      padding: var(--esphome-spacing-xs) 0;
    }

    .menu-dropdown.bottom {
      top: calc(100% + 4px);
      right: 0;
      transform-origin: top right;
    }

    .menu-dropdown.top {
      bottom: calc(100% + 4px);
      right: 0;
      transform-origin: bottom right;
    }

    .menu-dropdown.left {
      top: 0;
      right: calc(100% + 4px);
      transform-origin: top right;
    }

    .menu-dropdown.right {
      top: 0;
      left: calc(100% + 4px);
      transform-origin: top left;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: var(--esphome-spacing-m);
      width: 100%;
      min-height: 48px;
      padding: 0 var(--esphome-spacing-m);
      border: none;
      background: transparent;
      color: var(--esphome-text-primary);
      font-family: var(--esphome-font-family);
      font-size: var(--esphome-font-size-m);
      font-weight: var(--esphome-font-weight-normal);
      line-height: var(--esphome-line-height-normal);
      text-align: left;
      cursor: pointer;
      transition: background-color var(--esphome-transition-duration) var(--esphome-transition-timing);
      position: relative;
      white-space: nowrap;
    }

    .menu-item:hover:not(:disabled) {
      background-color: var(--esphome-hover-background);
    }

    .menu-item:focus-visible {
      outline: 2px solid var(--esphome-focus-color);
      outline-offset: -2px;
    }

    .menu-item:disabled {
      color: var(--esphome-text-disabled);
      cursor: not-allowed;
    }

    .menu-item.destructive {
      color: var(--esphome-error-color);
    }

    .menu-item.warning {
      color: var(--esphome-warning-color);
    }

    .menu-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      --mdc-icon-size: 24px;
    }

    .menu-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ha-svg-icon {
      display: inline-flex;
    }

    .menu-divider {
      height: 1px;
      margin: var(--esphome-spacing-xs) 0;
      background-color: var(--esphome-border-color);
    }

    /* Keyboard navigation */
    .menu-item:active:not(:disabled) {
      background-color: var(--esphome-hover-background);
      transform: scale(0.98);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .menu-trigger {
        width: 48px;
        height: 48px;
      }

      .menu-item {
        min-height: 56px;
        padding: 0 var(--esphome-spacing-l);
      }
    }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "esphome-action-menu": ESPHomeActionMenu;
  }
}
