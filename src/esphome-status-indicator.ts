import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { haTheme, haCommonStyles } from "./ha-theme.js";

export type StatusType = "online" | "offline" | "discovered" | "updating" | "unknown" | "unavailable" | "disabled" | "readonly";

@customElement("esphome-status-indicator")
export class ESPHomeStatusIndicator extends LitElement {
  @property() public status: StatusType = "unknown";
  @property({ type: Boolean }) public showText = true;
  @property() public text?: string;
  @property({ type: Boolean }) public small = false;

  private _getStatusText(): string {
    if (this.text) return this.text;
    
    switch (this.status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      case "discovered":
        return "Discovered";
      case "updating":
        return "Updating";
      case "unavailable":
        return "Unavailable";
      case "disabled":
        return "Disabled";
      case "readonly":
        return "Read-only";
      default:
        return "Unknown";
    }
  }

  protected render() {
    const showIcon = this.status === 'online' || this.status === 'offline';
    return html`
      <div class="status-container ${classMap({
        [this.status]: true,
        small: this.small
      })}">
        <span class="status-dot"></span>
        ${showIcon ? html`
          <mwc-icon class="status-icon">
            ${this.status === 'online' ? 'check' : 'close'}
          </mwc-icon>
        ` : ''}
        ${this.showText
          ? html`<span class="status-text">${this._getStatusText()}</span>`
          : ""}
      </div>
    `;
  }

  static styles = [haTheme, haCommonStyles, css`
    :host {
      display: inline-block;
    }

    .status-container {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .status-container.small {
      gap: 2px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      position: relative;
      box-shadow: 0 0 0 1px transparent;
      transition: background-color 0.2s ease,
                  box-shadow 0.2s ease;
    }

    .small .status-dot {
      width: 8px;
      height: 8px;
    }

    .status-text {
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
      color: #212121;
    }
    
    .status-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
    }
    
    mwc-icon {
      display: inline-flex;
    }

    .small .status-text {
      font-size: 12px;
    }

    /* Status colors */
    .online .status-dot {
      background-color: #4caf50;
    }
    
    .online .status-icon {
      color: #4caf50;
    }

    .offline .status-dot {
      background-color: #f44336;
    }
    
    .offline .status-icon {
      color: #f44336;
    }

    .discovered .status-dot {
      background-color: #03a9f4;
    }

    .updating .status-dot {
      background-color: #ff9800;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .updating .status-dot::before {
      content: "";
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 50%;
      background-color: #ff9800;
      opacity: 0.3;
      animation: ripple 1.5s ease-in-out infinite;
    }

    .unavailable .status-dot {
      background-color: #f44336;
      opacity: 0.5;
    }

    .disabled .status-dot {
      background-color: #9e9e9e;
    }

    .readonly .status-dot {
      background-color: #2196f3;
      opacity: 0.7;
    }

    .unknown .status-dot {
      background-color: #9e9e9e;
    }

    @keyframes pulse {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(0.95);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes ripple {
      0% {
        transform: scale(1);
        opacity: 0.3;
      }
      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    /* Icon mode - when used in icon columns */
    :host([icon]) .status-container {
      justify-content: center;
    }

    :host([icon]) .status-dot {
      width: 24px;
      height: 24px;
    }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "esphome-status-indicator": ESPHomeStatusIndicator;
  }
}
