import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Simple SVG icon component compatible with Home Assistant
 */
@customElement("ha-svg-icon")
export class HaSvgIcon extends LitElement {
  @property() public path = "";

  protected render() {
    return html`
      <svg viewBox="0 0 24 24">
        <path d=${this.path} fill="currentColor" />
      </svg>
    `;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      vertical-align: middle;
      fill: currentcolor;
      width: 24px;
      height: 24px;
    }

    svg {
      width: 100%;
      height: 100%;
      pointer-events: none;
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-svg-icon": HaSvgIcon;
  }
}