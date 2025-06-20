import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

export interface MenuItem {
  label: string;
  icon?: string;
  action: string;
  divider?: boolean;
  destructive?: boolean;
}

@customElement("esphome-action-menu")
export class ESPHomeActionMenu extends LitElement {
  @property({ attribute: false }) public items: MenuItem[] = [];
  @state() private _open = false;

  private _toggleMenu(e: Event) {
    e.stopPropagation();
    this._open = !this._open;
  }

  private _handleItemClick(item: MenuItem, e: Event) {
    e.stopPropagation();
    if (item.divider) return;

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
          class="menu-trigger"
          @click=${this._toggleMenu}
          aria-label="More actions"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
              fill="currentColor"
            />
          </svg>
        </button>

        ${this._open
          ? html`
              <div class="menu-dropdown">
                ${this.items.map(
                  (item) =>
                    item.divider
                      ? html`<div class="menu-divider"></div>`
                      : html`
                          <button
                            class=${classMap({
                              "menu-item": true,
                              destructive: !!item.destructive,
                            })}
                            @click=${(e: Event) => this._handleItemClick(item, e)}
                          >
                            ${item.icon
                              ? html`
                                  <svg
                                    class="menu-icon"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d=${item.icon}
                                      fill="currentColor"
                                    />
                                  </svg>
                                `
                              : ""}
                            <span>${item.label}</span>
                          </button>
                        `
                )}
              </div>
            `
          : ""}
      </div>
    `;
  }

  static styles = css`
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
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--esphome-text-secondary, #666666);
      border-radius: 50%;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .menu-trigger:hover {
      background-color: var(--esphome-hover-background, rgba(0, 0, 0, 0.04));
    }

    .menu-trigger:focus-visible {
      outline: 2px solid var(--esphome-focus-color, rgba(3, 169, 244, 0.4));
      outline-offset: 2px;
    }

    .menu-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 4px;
      min-width: 160px;
      background: var(--esphome-menu-background, #ffffff);
      border-radius: var(--esphome-border-radius, 4px);
      box-shadow: var(
        --esphome-menu-shadow,
        0 2px 8px rgba(0, 0, 0, 0.15)
      );
      z-index: 1000;
      overflow: hidden;
      animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: var(--esphome-text-primary, #212121);
      font-family: inherit;
      font-size: 14px;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .menu-item:hover {
      background-color: var(--esphome-hover-background, rgba(0, 0, 0, 0.04));
    }

    .menu-item:focus-visible {
      outline: 2px solid var(--esphome-focus-color, rgba(3, 169, 244, 0.4));
      outline-offset: -2px;
    }

    .menu-item.destructive {
      color: var(--esphome-error-color, #f44336);
    }

    .menu-icon {
      flex-shrink: 0;
    }

    .menu-divider {
      height: 1px;
      margin: 4px 0;
      background-color: var(--esphome-border-color, #e0e0e0);
    }

    /* Dark mode adjustments */
    @media (prefers-color-scheme: dark) {
      .menu-trigger {
        color: var(--esphome-text-secondary, #999999);
      }

      .menu-dropdown {
        background: var(--esphome-menu-background, #2a2a2a);
        box-shadow: var(
          --esphome-menu-shadow,
          0 2px 8px rgba(0, 0, 0, 0.4)
        );
      }

      .menu-item {
        color: var(--esphome-text-primary, #e0e0e0);
      }

      .menu-item:hover {
        background-color: var(--esphome-hover-background, rgba(255, 255, 255, 0.08));
      }

      .menu-divider {
        background-color: var(--esphome-border-color, #404040);
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "esphome-action-menu": ESPHomeActionMenu;
  }
}
