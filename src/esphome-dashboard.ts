import { LitElement, html, css, TemplateResult, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "./esphome-status-indicator.js";
import "./esphome-button.js";
import "./esphome-action-menu.js";
import "./search-input.js";
import "@material/mwc-icon";
import "@material/mwc-icon-button";

interface ESPHomeDevice {
  id: string;
  name: string;
  type: string;
  icon: string;
  status: "online" | "offline" | "update-available";
  updateAvailable?: boolean;
  fileName: string;
  discovered?: boolean;
}

@customElement("esphome-dashboard")
export class ESPHomeDashboard extends LitElement {
  @property({ attribute: false }) public devices: ESPHomeDevice[] = [];
  @property() public version = "2024.9.2";
  
  @state() private _searchQuery = "";
  @state() private _yourDevicesCollapsed = false;
  @state() private _discoveredCollapsed = false;
  @state() private _viewMode: "list" | "grid" = "list";
  @state() private _sortBy = "name";
  @state() private _groupBy = "";

  private _handleSearch(e: CustomEvent) {
    this._searchQuery = e.detail.value;
  }

  private _toggleSection(section: "your" | "discovered") {
    if (section === "your") {
      this._yourDevicesCollapsed = !this._yourDevicesCollapsed;
    } else {
      this._discoveredCollapsed = !this._discoveredCollapsed;
    }
  }

  private _handleDeviceAction(device: ESPHomeDevice, action: string) {
    this.dispatchEvent(
      new CustomEvent("device-action", {
        detail: { device, action },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _renderHeader() {
    return html`
      <div class="esphome-header">
        <div class="esphome-header-title">
          <mwc-icon class="esphome-header-icon">home</mwc-icon>
          <span>ESPHome Device Builder</span>
        </div>
        <div class="esphome-header-actions">
          <button class="esphome-create-button">
            Create device
          </button>
          <mwc-icon-button icon="more_vert"></mwc-icon-button>
        </div>
      </div>
    `;
  }

  private _renderToolbar() {
    return html`
      <div class="esphome-toolbar">
        <button class="esphome-filter-button">
          <mwc-icon>filter_list</mwc-icon>
          <span>Filters</span>
          <mwc-icon>arrow_drop_down</mwc-icon>
        </button>
        
        <button class="esphome-view-toggle">
          <mwc-icon>view_list</mwc-icon>
        </button>
        
        <div class="esphome-search-container">
          <mwc-icon class="esphome-search-icon">search</mwc-icon>
          <input
            type="text"
            class="esphome-search-input"
            placeholder="Search 8 ESPHome devices"
            @input=${(e: Event) => this._searchQuery = (e.target as HTMLInputElement).value}
          />
        </div>
        
        <button class="esphome-dropdown">
          <span>Group by</span>
          <mwc-icon>arrow_drop_down</mwc-icon>
        </button>
        
        <button class="esphome-dropdown">
          <span>Sort by Name</span>
          <mwc-icon>arrow_drop_down</mwc-icon>
        </button>
        
        <div class="esphome-toolbar-icons">
          <mwc-icon-button icon="view_list"></mwc-icon-button>
          <mwc-icon-button icon="view_module"></mwc-icon-button>
          <mwc-icon-button icon="settings"></mwc-icon-button>
        </div>
      </div>
    `;
  }

  private _renderDeviceItem(device: ESPHomeDevice) {
    const statusClass = device.updateAvailable ? "update-available" : device.status;
    
    return html`
      <div class="esphome-device-item">
        <div class="esphome-device-icon ${device.icon}">
          <mwc-icon>
            ${device.icon === "sensor" ? "sensors" : 
              device.icon === "voice" ? "mic" :
              device.icon === "pulse" ? "memory" :
              device.icon === "weather" ? "wb_sunny" :
              "devices"}
          </mwc-icon>
        </div>
        
        <div class="esphome-device-info">
          <div class="esphome-device-name">${device.name}</div>
          <div class="esphome-device-type">${device.type}</div>
        </div>
        
        <div class="esphome-status ${statusClass}">
          ${device.status === "online" ? html`
            <mwc-icon class="esphome-status-icon">check_circle</mwc-icon>
            <span class="esphome-status-text">Online</span>
          ` : device.status === "offline" ? html`
            <mwc-icon class="esphome-status-icon">cancel</mwc-icon>
            <span class="esphome-status-text">Offline</span>
          ` : html`
            <div>
              <mwc-icon class="esphome-status-icon">check_circle</mwc-icon>
              <span class="esphome-status-text">Online</span>
            </div>
            ${device.updateAvailable ? html`
              <div class="esphome-update-text">
                <mwc-icon style="width: 14px; height: 14px; color: #ff9800;">circle</mwc-icon>
                Update available
              </div>
            ` : nothing}
          `}
        </div>
        
        ${device.discovered ? html`
          <button class="esphome-take-control" @click=${() => this._handleDeviceAction(device, "take-control")}>
            Take control
          </button>
        ` : html`
          <div class="esphome-file-name">${device.fileName}</div>
          <div class="esphome-device-actions">
            <mwc-icon-button 
              icon="open_in_new" 
              @click=${() => this._handleDeviceAction(device, "open")}
            ></mwc-icon-button>
            <mwc-icon-button 
              icon="edit" 
              @click=${() => this._handleDeviceAction(device, "edit")}
            ></mwc-icon-button>
            <mwc-icon-button 
              icon="more_vert" 
              @click=${() => this._handleDeviceAction(device, "menu")}
            ></mwc-icon-button>
          </div>
        `}
      </div>
    `;
  }

  private _renderDeviceSection(title: string, devices: ESPHomeDevice[], collapsed: boolean, section: "your" | "discovered") {
    if (devices.length === 0) return nothing;
    
    return html`
      <div class="esphome-device-section">
        ${section === "your" && !collapsed ? html`
          <div class="esphome-table-header">
            <div class="esphome-header-cell name">
              <span>Name</span>
              <mwc-icon>arrow_downward</mwc-icon>
            </div>
            <div class="esphome-header-cell status">Status</div>
            <div class="esphome-header-cell filename">File name</div>
            <div class="esphome-header-cell actions"></div>
          </div>
        ` : nothing}
        
        <div class="esphome-section-header" @click=${() => this._toggleSection(section)}>
          <mwc-icon class="esphome-expand-icon ${collapsed ? 'collapsed' : ''}">
            expand_more
          </mwc-icon>
          <span class="esphome-section-title">${title}</span>
        </div>
        ${!collapsed ? html`
          <div class="esphome-device-list">
            ${devices.map(device => this._renderDeviceItem(device))}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderFooter() {
    return html`
      <div class="esphome-footer">
        ESPHome is a project by Open Home Foundation | 
        <a href="https://www.openhomefoundation.org/fund" target="_blank">Fund development</a> | 
        <a href="https://esphome.io/docs/${this.version}" target="_blank">${this.version} Documentation</a>
      </div>
    `;
  }

  render() {
    const filteredDevices = this.devices.filter(device => 
      device.name.toLowerCase().includes(this._searchQuery.toLowerCase()) ||
      device.type.toLowerCase().includes(this._searchQuery.toLowerCase())
    );
    
    const yourDevices = filteredDevices.filter(d => !d.discovered);
    const discoveredDevices = filteredDevices.filter(d => d.discovered);
    
    return html`
      ${this._renderHeader()}
      ${this._renderToolbar()}
      <div class="esphome-content">
        ${this._renderDeviceSection("Your devices", yourDevices, this._yourDevicesCollapsed, "your")}
        ${this._renderDeviceSection("Discovered", discoveredDevices, this._discoveredCollapsed, "discovered")}
      </div>
      ${this._renderFooter()}
    `;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background-color: #f5f5f5;
      font-family: Roboto, sans-serif;
    }

    /* Header Styles */
    .esphome-header {
      background-color: #e3f2fd;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .esphome-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .esphome-header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 500;
      color: #1e88e5;
    }

    .esphome-header-icon {
      width: 24px;
      height: 24px;
      color: #1e88e5;
    }

    .esphome-create-button {
      background-color: #1e88e5;
      color: white;
      border: none;
      border-radius: 24px;
      padding: 8px 24px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
    }

    .esphome-create-button:hover {
      background-color: #1976d2;
    }

    .esphome-create-button::before {
      content: '+';
      font-size: 18px;
      font-weight: bold;
    }

    /* Toolbar Styles */
    .esphome-toolbar {
      background-color: #f5f5f5;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .esphome-filter-button,
    .esphome-view-toggle,
    .esphome-dropdown {
      background-color: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 14px;
      color: #424242;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 36px;
    }

    .esphome-search-container {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      background-color: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 0 12px;
    }

    .esphome-search-icon {
      color: #757575;
      margin-right: 8px;
    }

    .esphome-search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      padding: 8px 0;
      background: transparent;
    }

    .esphome-toolbar-icons {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Content area */
    .esphome-content {
      background-color: white;
      min-height: calc(100vh - 200px);
    }

    /* Table header */
    .esphome-table-header {
      display: flex;
      align-items: center;
      padding: 12px 24px;
      background-color: #fafafa;
      border-bottom: 1px solid #e0e0e0;
      font-size: 12px;
      font-weight: 500;
      color: #757575;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .esphome-header-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .esphome-header-cell.name {
      width: 56px;
      margin-right: 16px;
      flex: 1;
      cursor: pointer;
    }

    .esphome-header-cell.name mwc-icon {
      font-size: 16px;
    }

    .esphome-header-cell.status {
      width: 150px;
    }

    .esphome-header-cell.filename {
      flex: 0 0 200px;
      margin-right: 16px;
    }

    .esphome-header-cell.actions {
      width: 120px;
    }

    /* Device sections */
    .esphome-device-section {
      border-bottom: 1px solid #e0e0e0;
    }

    .esphome-device-section:last-child {
      border-bottom: none;
    }

    .esphome-section-header {
      display: flex;
      align-items: center;
      padding: 12px 24px;
      cursor: pointer;
      user-select: none;
      background-color: #fafafa;
      transition: background-color 0.2s;
    }

    .esphome-section-header:hover {
      background-color: #f5f5f5;
    }

    .esphome-expand-icon {
      width: 24px;
      height: 24px;
      color: #757575;
      transition: transform 0.2s;
      margin-right: 8px;
    }

    .esphome-expand-icon.collapsed {
      transform: rotate(-90deg);
    }

    .esphome-section-title {
      font-size: 14px;
      font-weight: 500;
      color: #424242;
    }

    /* Device items */
    .esphome-device-item {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #f5f5f5;
      transition: background-color 0.2s;
    }

    .esphome-device-item:hover {
      background-color: #fafafa;
    }

    .esphome-device-item:last-child {
      border-bottom: none;
    }

    .esphome-device-icon {
      width: 40px;
      height: 40px;
      margin-right: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #757575;
    }

    .esphome-device-icon.sensor {
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .esphome-device-icon.voice {
      color: #4285f4;
    }

    .esphome-device-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .esphome-device-name {
      font-size: 14px;
      font-weight: 500;
      color: #212121;
    }

    .esphome-device-type {
      font-size: 12px;
      color: #757575;
    }

    /* Status styles */
    .esphome-status {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-right: 24px;
    }

    .esphome-status-icon {
      width: 18px;
      height: 18px;
    }

    .esphome-status.online .esphome-status-icon {
      color: #4caf50;
    }

    .esphome-status.offline .esphome-status-icon {
      color: #f44336;
    }

    .esphome-status.update-available {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }

    .esphome-status-text {
      font-size: 12px;
      color: #757575;
    }

    .esphome-status.online .esphome-status-text {
      color: #4caf50;
    }

    .esphome-status.offline .esphome-status-text {
      color: #f44336;
    }

    .esphome-update-text {
      font-size: 11px;
      color: #ff9800;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* File name */
    .esphome-file-name {
      font-size: 12px;
      color: #9e9e9e;
      margin-right: 16px;
      font-family: 'Roboto Mono', monospace;
    }

    /* Action buttons */
    .esphome-device-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Take control button */
    .esphome-take-control {
      color: #1e88e5;
      background: transparent;
      border: none;
      padding: 6px 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .esphome-take-control:hover {
      background-color: #e3f2fd;
    }

    /* Footer */
    .esphome-footer {
      background-color: #f5f5f5;
      padding: 16px 24px;
      text-align: center;
      font-size: 12px;
      color: #757575;
      border-top: 1px solid #e0e0e0;
    }

    .esphome-footer a {
      color: #1e88e5;
      text-decoration: none;
      margin: 0 4px;
    }

    .esphome-footer a:hover {
      text-decoration: underline;
    }

    /* Material icons */
    mwc-icon {
      --mdc-icon-size: 20px;
    }

    mwc-icon-button {
      --mdc-icon-size: 20px;
      --mdc-icon-button-size: 36px;
      color: #757575;
    }

    mwc-icon-button:hover {
      color: #424242;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "esphome-dashboard": ESPHomeDashboard;
  }
}