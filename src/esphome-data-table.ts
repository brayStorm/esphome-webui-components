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
  @property() public id = "id";
  @property({ attribute: false }) public hiddenColumns?: string[];
  @state() private _sortColumn?: string;
  @state() private _sortDirection?: "asc" | "desc" | null = null;
  @state() private _selectedRows = new Set<string>();

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
          detail: { id: row[this.id] },
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
    if (this.filter) {
      const filterLower = this.filter.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(filterLower)
        )
      );
    }

    // Apply sort
    if (this._sortColumn && this._sortDirection) {
      filtered.sort((a, b) => {
        const aVal = a[this._sortColumn!];
        const bVal = b[this._sortColumn!];
        
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
                            <ha-svg-icon
                              class="sort-icon"
                              .path=${this._sortDirection === "desc"
                                ? "M7 10l5 5 5-5"
                                : "M7 14l5-5 5 5"}
                            ></ha-svg-icon>
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
              (row) => row.id || row.name || JSON.stringify(row),
              (row) => html`
                <tr
                  class=${classMap({ 
                    clickable: this.clickable,
                    selected: this._selectedRows.has(row[this.id])
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
                                  .checked=${this._selectedRows.has(row[this.id])}
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

  static styles = [haTheme, haCommonStyles, css`
    :host {
      display: block;
      width: 100%;
      --data-table-row-height: var(--esphome-table-row-height);
    }

    .table-wrapper {
      position: relative;
      width: 100%;
      overflow-x: auto;
      background: var(--esphome-table-background);
      border-radius: var(--esphome-border-radius);
      box-shadow: var(--esphome-box-shadow);
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
      background: var(--esphome-table-header-background);
      border-bottom: 1px solid var(--esphome-border-color);
    }

    thead tr {
      height: var(--esphome-table-header-height);
    }

    th {
      padding: 0 var(--esphome-spacing-m);
      text-align: left;
      font-weight: var(--esphome-font-weight-medium);
      color: var(--esphome-text-secondary);
      font-size: var(--esphome-font-size-s);
      line-height: var(--esphome-line-height-normal);
      user-select: none;
      white-space: nowrap;
      vertical-align: middle;
    }

    th.checkbox-cell {
      width: var(--esphome-table-checkbox-cell-width);
      padding: 0;
      text-align: center;
    }

    th.icon {
      width: var(--esphome-table-icon-cell-width);
    }

    th.sortable {
      cursor: pointer;
      position: relative;
    }

    th.sortable:hover {
      color: var(--esphome-text-primary);
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

    ha-svg-icon {
      display: inline-flex;
      width: 24px;
      height: 24px;
    }

    tbody tr {
      height: var(--data-table-row-height);
      border-bottom: 1px solid var(--esphome-border-color);
      transition: background-color var(--esphome-transition-duration) var(--esphome-transition-timing);
    }

    tbody tr.selected {
      background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    }

    tbody tr:last-child {
      border-bottom: none;
    }

    tbody tr:hover {
      background-color: var(--esphome-hover-background);
    }

    tbody tr.selected:hover {
      background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
    }

    tbody tr.clickable {
      cursor: pointer;
    }

    td {
      padding: var(--esphome-spacing-s) var(--esphome-spacing-m);
      color: var(--esphome-text-primary);
      vertical-align: middle;
      overflow: hidden;
    }

    td.checkbox-cell {
      width: var(--esphome-table-checkbox-cell-width);
      padding: 0;
      text-align: center;
    }

    td.icon {
      width: var(--esphome-table-icon-cell-width);
      padding: var(--esphome-spacing-s);
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
      padding: var(--esphome-spacing-xl) var(--esphome-spacing-l);
      text-align: center;
      color: var(--esphome-text-secondary);
      background: var(--esphome-table-background);
      border-radius: var(--esphome-border-radius);
      box-shadow: var(--esphome-box-shadow);
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
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "esphome-data-table": ESPHomeDataTable;
  }
}
