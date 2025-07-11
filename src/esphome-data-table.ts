import { LitElement, html, css, TemplateResult, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { haTheme, haCommonStyles } from "./ha-theme.js";
import { debounce } from "./utils.js";

export interface DataTableColumn {
  key: string;
  title: string;
  label?: string;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  hidden?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  flex?: number;
  align?: "left" | "center" | "right";
  type?: "numeric" | "icon" | "icon-button" | "overflow-menu";
  template?: (value: any, row: any) => TemplateResult | string | typeof nothing;
  extraTemplate?: (value: any, row: any) => TemplateResult | string | typeof nothing;
}

export interface DataTableRow {
  [key: string]: any;
  id?: string;
  selectable?: boolean;
}

@customElement("esphome-data-table")
export class ESPHomeDataTable extends LitElement {
  @property({ attribute: false }) public columns: DataTableColumn[] = [];
  @property({ attribute: false }) public data: DataTableRow[] = [];
  @property() public filter = "";
  @property({ type: Boolean }) public clickable = false;
  @property({ type: Boolean }) public selectable = false;
  @property({ type: Boolean }) public narrow = false;
  @property({ type: Boolean, attribute: "auto-height" }) public autoHeight = false;
  @property() public noDataText = "No data";
  @property() public id = "name";
  @property({ attribute: false }) public hiddenColumns?: string[];
  @property({ attribute: false }) public groupColumn?: string;
  @property({ attribute: false }) public groupOrder?: string[];
  @property({ attribute: false }) public groupHeaders?: { [key: string]: string };
  @property({ attribute: false }) public initialCollapsedGroups?: string[];
  @property() public sortColumn?: string;
  @property() public sortDirection?: "asc" | "desc";
  @state() private _sortColumn?: string;
  @state() private _sortDirection?: "asc" | "desc" | null = null;
  @state() private _selectedRows = new Set<string>();
  @state() private _collapsedGroups: string[] = [];
  @state() private _filter = "";
  
  private _debounceFilter = debounce((value: string) => {
    this._filter = value;
    this.requestUpdate();
  }, 300);

  private _handleSort(column: DataTableColumn) {
    if (!column.sortable) return;

    if (this._sortColumn === column.key) {
      if (this._sortDirection === "asc") {
        this._sortDirection = "desc";
      } else if (this._sortDirection === "desc") {
        this._sortDirection = null;
        this._sortColumn = undefined;
      } else {
        this._sortDirection = "asc";
      }
    } else {
      this._sortColumn = column.key;
      this._sortDirection = "asc";
    }

    this.dispatchEvent(
      new CustomEvent("sorting-changed", {
        detail: { column: this._sortColumn, direction: this._sortDirection },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleRowClick(row: DataTableRow, event: Event) {
    if (!this.clickable && !this.selectable) return;
    
    const checkbox = event.composedPath()[0] as HTMLElement;
    if (checkbox.tagName === "INPUT" && checkbox.getAttribute("type") === "checkbox") {
      return;
    }
    
    if (this.clickable) {
      this.dispatchEvent(
        new CustomEvent("row-click", {
          detail: { id: row[this.id], row },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private _handleRowSelection(row: DataTableRow, checked: boolean) {
    const rowId = row[this.id];
    if (checked) {
      this._selectedRows.add(rowId);
    } else {
      this._selectedRows.delete(rowId);
    }
    this.requestUpdate();
    
    this.dispatchEvent(
      new CustomEvent("selection-changed", {
        detail: { value: Array.from(this._selectedRows) },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleSelectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const selectableRows = this._getFilteredData().filter(row => row.selectable !== false);
    
    if (checkbox.checked) {
      selectableRows.forEach(row => this._selectedRows.add(row[this.id]));
    } else {
      this._selectedRows.clear();
    }
    this.requestUpdate();
    
    this.dispatchEvent(
      new CustomEvent("selection-changed", {
        detail: { value: Array.from(this._selectedRows) },
        bubbles: true,
        composed: true,
      })
    );
  }

  private get _visibleColumns() {
    return this.columns.filter(col => 
      !col.hidden && (!this.hiddenColumns || !this.hiddenColumns.includes(col.key))
    );
  }

  private _getFilteredData(): DataTableRow[] {
    let filtered = [...this.data];

    // Apply filter
    const filterValue = this.filter || this._filter;
    if (filterValue) {
      const filterLower = filterValue.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(filterLower)
        )
      );
    }

    // Apply sort
    if (this._sortColumn && this._sortDirection) {
      filtered.sort((a, b) => {
        let aVal = a[this._sortColumn!];
        let bVal = b[this._sortColumn!];
        
        // Handle special status sorting
        if (this._sortColumn === 'status') {
          // Convert status to sortable values
          const statusOrder = { 'online': 1, 'offline': 2, 'discovered': 3, 'update-available': 4, 'updating': 5 };
          aVal = statusOrder[aVal as string] || 99;
          bVal = statusOrder[bVal as string] || 99;
        }
        
        // Handle numeric sorting
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return this._sortDirection === "asc" ? aNum - bNum : bNum - aNum;
        }

        // String sorting
        const result = String(aVal).localeCompare(String(bVal));
        return this._sortDirection === "asc" ? result : -result;
      });
    }

    return filtered;
  }

  private _isAllSelected(): boolean {
    const selectableRows = this._getFilteredData().filter(row => row.selectable !== false);
    return selectableRows.length > 0 && selectableRows.every(row => this._selectedRows.has(row[this.id]));
  }

  private _isSomeSelected(): boolean {
    return this._selectedRows.size > 0 && !this._isAllSelected();
  }

  protected render() {
    if (this.groupColumn) {
      return this._renderGroupedTable();
    }
    
    const filteredData = this._getFilteredData();

    if (filteredData.length === 0) {
      return html`
        <div class="no-data">
          <p>${this.noDataText}</p>
        </div>
      `;
    }

    return html`
      <div class="table-wrapper ${classMap({ narrow: this.narrow })}">
        <table>
          <thead>
            <tr>
              ${this.selectable
                ? html`
                    <th class="checkbox-cell">
                      <input
                        type="checkbox"
                        .checked=${this._isAllSelected()}
                        .indeterminate=${this._isSomeSelected()}
                        @change=${this._handleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                  `
                : nothing}
              ${this._visibleColumns.map(
                (column) => html`
                  <th
                    class=${classMap({
                      sortable: !!column.sortable,
                      sorted: this._sortColumn === column.key,
                      [column.align || "left"]: true,
                      [column.type || ""]: true,
                    })}
                    style=${styleMap({
                      width: column.width || "auto",
                      minWidth: column.minWidth || "auto",
                      maxWidth: column.maxWidth || "none",
                      flex: column.flex ? String(column.flex) : "auto",
                    })}
                    @click=${() => this._handleSort(column)}
                  >
                    <div class="header-content">
                      <span class="header-text">${column.title}</span>
                      ${column.sortable && this._sortColumn === column.key
                        ? html`
                            <mwc-icon class="sort-icon">
                              ${this._sortDirection === "desc" ? "arrow_downward" : "arrow_upward"}
                            </mwc-icon>
                          `
                        : nothing}
                    </div>
                  </th>
                `
              )}
            </tr>
          </thead>
          <tbody>
            ${repeat(
              filteredData,
              (row) => row[this.id] || row.name || JSON.stringify(row),
              (row) => html`
                <tr
                  class=${classMap({ 
                    clickable: this.clickable,
                    selected: this._selectedRows.has(row.name || row[this.id])
                  })}
                  @click=${(e: Event) => this._handleRowClick(row, e)}
                >
                  ${this.selectable
                    ? html`
                        <td class="checkbox-cell">
                          ${row.selectable !== false
                            ? html`
                                <input
                                  type="checkbox"
                                  .checked=${this._selectedRows.has(row.name || row[this.id])}
                                  @change=${(e: Event) => 
                                    this._handleRowSelection(row, (e.target as HTMLInputElement).checked)
                                  }
                                  aria-label="Select row"
                                />
                              `
                            : nothing}
                        </td>
                      `
                    : nothing}
                  ${this._visibleColumns.map((column) => {
                    const value = row[column.key];
                    const content = column.template
                      ? column.template(value, row)
                      : value;

                    return html`
                      <td class="${classMap({
                        [column.align || "left"]: true,
                        [column.type || ""]: true,
                      })}">
                        <div class="cell-content">
                          ${content}
                          ${column.extraTemplate ? column.extraTemplate(value, row) : nothing}
                        </div>
                      </td>
                    `;
                  })}
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  private _renderGroupedTable() {
    const groupedData = this._getGroupedData();
    const groupKeys = Object.keys(groupedData);

    if (groupKeys.length === 0) {
      return html`
        <div class="no-data">
          <p>${this.noDataText}</p>
        </div>
      `;
    }

    return html`
      <div class="grouped-table-wrapper">
        ${groupKeys.map(groupKey => {
          const isCollapsed = this._collapsedGroups.includes(groupKey);
          const groupRows = groupedData[groupKey];
          
          return html`
            <div class="group-section">
              <div class="group-header" @click=${() => this._toggleGroup(groupKey)}>
                <mwc-icon class="expand-icon ${isCollapsed ? 'collapsed' : ''}">expand_more</mwc-icon>
                <span class="group-title">${this.groupHeaders?.[groupKey] || groupKey}</span>
              </div>
              ${!isCollapsed ? html`
                <div class="table-wrapper ${classMap({ narrow: this.narrow })}">
                  <table>
                    ${groupKeys.length > 1 ? html`
                      <thead>
                        <tr>
                          ${this.selectable
                            ? html`
                                <th class="checkbox-cell">
                                  <input
                                    type="checkbox"
                                    .checked=${this._isAllSelected()}
                                    .indeterminate=${this._isSomeSelected()}
                                    @change=${this._handleSelectAll}
                                    aria-label="Select all"
                                  />
                                </th>
                              `
                            : nothing}
                          ${this._visibleColumns.map(
                            (column) => html`
                              <th
                                class=${classMap({
                                  sortable: !!column.sortable,
                                  sorted: this._sortColumn === column.key,
                                  [column.align || "left"]: true,
                                  [column.type || ""]: true,
                                })}
                                style=${styleMap({
                                  width: column.width || "auto",
                                  minWidth: column.minWidth || "auto",
                                  maxWidth: column.maxWidth || "none",
                                  flex: column.flex ? String(column.flex) : "auto",
                                })}
                                @click=${() => this._handleSort(column)}
                              >
                                <div class="header-content">
                                  <span class="header-text">${column.title}</span>
                                  ${column.sortable && this._sortColumn === column.key
                                    ? html`
                                        <mwc-icon class="sort-icon">
                                          ${this._sortDirection === "desc" ? "arrow_downward" : "arrow_upward"}
                                        </mwc-icon>
                                      `
                                    : nothing}
                                </div>
                              </th>
                            `
                          )}
                        </tr>
                      </thead>
                    ` : nothing}
                    <tbody>
                      ${repeat(
                        groupRows,
                        (row) => row[this.id] || row.name || JSON.stringify(row),
                        (row) => html`
                          <tr
                            class=${classMap({ 
                              clickable: this.clickable,
                              selected: this._selectedRows.has(row.name || row[this.id])
                            })}
                            @click=${(e: Event) => this._handleRowClick(row, e)}
                          >
                            ${this.selectable
                              ? html`
                                  <td class="checkbox-cell">
                                    ${row.selectable !== false
                                      ? html`
                                          <input
                                            type="checkbox"
                                            .checked=${this._selectedRows.has(row.name || row[this.id])}
                                            @change=${(e: Event) => 
                                              this._handleRowSelection(row, (e.target as HTMLInputElement).checked)
                                            }
                                            aria-label="Select row"
                                          />
                                        `
                                      : nothing}
                                  </td>
                                `
                              : nothing}
                            ${this._visibleColumns.map((column) => {
                              const value = row[column.key];
                              const content = column.template
                                ? column.template(value, row)
                                : value;

                              return html`
                                <td class="${classMap({
                                  [column.align || "left"]: true,
                                  [column.type || ""]: true,
                                })}">
                                  <div class="cell-content">
                                    ${content}
                                    ${column.extraTemplate ? column.extraTemplate(value, row) : nothing}
                                  </div>
                                </td>
                              `;
                            })}
                          </tr>
                        `
                      )}
                    </tbody>
                  </table>
                </div>
              ` : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  static styles = [haTheme, haCommonStyles, css`
    :host {
      display: block;
      width: 100%;
      --data-table-row-height: 72px;
    }

    .table-wrapper {
      position: relative;
      width: 100%;
      overflow-x: auto;
      background: white;
      border-radius: 0;
      box-shadow: none;
    }

    .table-wrapper.narrow {
      --data-table-row-height: 72px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--esphome-font-size-m);
      font-family: var(--esphome-font-family);
    }

    thead {
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
    }

    thead tr {
      height: 48px;
    }

    th {
      padding: 0 16px;
      text-align: left;
      font-weight: 500;
      color: #757575;
      font-size: 12px;
      line-height: 1.5;
      user-select: none;
      white-space: nowrap;
      vertical-align: middle;
      text-transform: uppercase;
    }

    th.checkbox-cell {
      width: 48px;
      padding: 0;
      text-align: center;
    }

    th.icon {
      width: 50px;
    }

    th.sortable {
      cursor: pointer;
      position: relative;
    }

    th.sortable:hover {
      color: #212121;
      background: #f5f5f5;
    }

    th.center {
      text-align: center;
    }

    th.right {
      text-align: right;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: var(--esphome-spacing-xs);
      justify-content: space-between;
    }

    .header-text {
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .sort-icon {
      color: var(--esphome-text-secondary);
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    mwc-icon {
      display: inline-flex;
      width: 18px;
      height: 18px;
    }

    tbody tr {
      height: var(--data-table-row-height);
      border-bottom: 1px solid #f5f5f5;
      transition: background-color 0.2s ease;
    }

    tbody tr.selected {
      background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    }

    tbody tr:last-child {
      border-bottom: none;
    }

    tbody tr:hover {
      background-color: #fafafa;
    }

    tbody tr.selected:hover {
      background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
    }

    tbody tr.clickable {
      cursor: pointer;
    }

    td {
      padding: 16px;
      color: #212121;
      vertical-align: middle;
      overflow: hidden;
    }

    td.checkbox-cell {
      width: 48px;
      padding: 0;
      text-align: center;
    }

    td.icon {
      width: 50px;
      padding: 8px;
    }

    .cell-content {
      display: flex;
      flex-direction: column;
      gap: var(--esphome-spacing-xs);
    }

    td.center {
      text-align: center;
    }

    td.right {
      text-align: right;
    }

    .no-data {
      padding: 48px 32px;
      text-align: center;
      color: #757575;
      background: white;
      border-radius: 0;
      box-shadow: none;
    }

    .no-data p {
      margin: 0;
      font-size: var(--esphome-font-size-m);
    }

    /* Checkbox styling */
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      margin: 0;
    }

    /* Scrollbar styling */
    .table-wrapper::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .table-wrapper::-webkit-scrollbar-track {
      background: transparent;
    }

    .table-wrapper::-webkit-scrollbar-thumb {
      background: var(--esphome-border-color);
      border-radius: 4px;
    }

    .table-wrapper::-webkit-scrollbar-thumb:hover {
      background: var(--esphome-text-secondary);
    }

    /* Grouped table styles */
    .grouped-table-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--esphome-spacing-m);
    }

    .group-section {
      background: white;
      border-radius: 0;
      box-shadow: none;
      overflow: hidden;
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
      transition: background-color 0.2s ease;
      font-weight: 500;
    }

    .group-header:hover {
      background: #eeeeee;
    }

    .expand-icon {
      color: var(--esphome-text-secondary);
      transition: transform var(--esphome-transition-duration) var(--esphome-transition-timing);
    }

    .expand-icon.collapsed {
      transform: rotate(-90deg);
    }

    .group-title {
      font-size: var(--esphome-font-size-m);
      font-weight: var(--esphome-font-weight-medium);
      color: var(--esphome-text-primary);
      text-transform: capitalize;
    }

    /* Responsive */
    @media (max-width: 768px) {
      :host {
        --data-table-row-height: 60px;
      }
      
      th, td {
        padding: var(--esphome-spacing-s) var(--esphome-spacing-s);
      }
      
      th {
        font-size: var(--esphome-font-size-xs);
      }
      
      td {
        font-size: var(--esphome-font-size-s);
      }
    }
  `];

  connectedCallback() {
    super.connectedCallback();
    if (this.initialCollapsedGroups) {
      this._collapsedGroups = [...this.initialCollapsedGroups];
    }
  }

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    
    if (changedProperties.has('filter') && this.filter !== this._filter) {
      this._debounceFilter(this.filter);
    }
    
    // Sync external sort properties
    if (changedProperties.has('sortColumn') && this.sortColumn !== this._sortColumn) {
      this._sortColumn = this.sortColumn;
    }
    
    if (changedProperties.has('sortDirection') && this.sortDirection !== this._sortDirection) {
      this._sortDirection = this.sortDirection;
    }
  }

  private _getGroupedData(): Record<string, DataTableRow[]> {
    if (!this.groupColumn) {
      return {};
    }

    const filtered = this._getFilteredData();
    const grouped: Record<string, DataTableRow[]> = {};

    filtered.forEach((row) => {
      let groupValue = String(row[this.groupColumn!] || 'Other');
      
      // Handle special grouping cases
      if (this.groupColumn === 'status') {
        // Convert status values to readable names
        const statusMap: Record<string, string> = {
          'online': 'Online',
          'offline': 'Offline', 
          'discovered': 'Discovered',
          'update-available': 'Update Available',
          'updating': 'Updating'
        };
        groupValue = statusMap[groupValue] || groupValue;
      } else if (this.groupColumn === 'deviceType') {
        // Convert device type to readable names
        const typeMap: Record<string, string> = {
          'configured': 'Your devices',
          'discovered': 'Discovered'
        };
        groupValue = typeMap[groupValue] || groupValue;
      }
      
      if (!grouped[groupValue]) {
        grouped[groupValue] = [];
      }
      grouped[groupValue].push(row);
    });

    return grouped;
  }

  private _toggleGroup(groupKey: string) {
    if (this._collapsedGroups.includes(groupKey)) {
      this._collapsedGroups = this._collapsedGroups.filter(g => g !== groupKey);
    } else {
      this._collapsedGroups = [...this._collapsedGroups, groupKey];
    }
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "esphome-data-table": ESPHomeDataTable;
  }
}
