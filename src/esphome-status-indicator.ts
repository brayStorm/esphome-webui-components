import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

export type StatusType = "online" | "offline" | "discovered" | "updating" | "unknown";

@customElement("esphome-status-indicator")
export class ESPHomeStatusIndicator extends LitElement {
  @property() public status: StatusType = "unknown";
  @property({ type: Boolean }) public showText = true;
  @property() public text?: string;

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
      default:
        return "Unknown";
    }
  }

  protected render() {
    return html`
      <div class="status-container ${this.status}">
        <span class="status-dot"></span>
        ${this.showText
          ? html`<span class="status-text">${this._getStatusText()}</span>`
          : ""}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: inline-block;
    }

    .status-container {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      position: relative;
    }

    .status-text {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1;
    }

    /* Status colors */
    .online .status-dot {
      background-color: var(--esphome-status-online, #4caf50);
    }

    .online .status-text {
      color: var(--esphome-status-online, #4caf50);
    }

    .offline .status-dot {
      background-color: var(--esphome-status-offline, #f44336);
    }

    .offline .status-text {
      color: var(--esphome-status-offline, #f44336);
    }

    .discovered .status-dot {
      background-color: var(--esphome-status-discovered, #2196f3);
    }

    .discovered .status-text {
      color: var(--esphome-status-discovered, #2196f3);
    }

    .updating .status-dot {
      background-color: var(--esphome-status-updating, #ff9800);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .updating .status-text {
      color: var(--esphome-status-updating, #ff9800);
    }

    .unknown .status-dot {
      background-color: var(--esphome-status-unknown, #9e9e9e);
    }

    .unknown .status-text {
      color: var(--esphome-status-unknown, #9e9e9e);
    }

    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
      100% {
        opacity: 1;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "esphome-status-indicator": ESPHomeStatusIndicator;
  }
}
