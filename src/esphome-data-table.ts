import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { classMap } from "lit/directives/class-map.js";

export interface DataTableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  template?: (value: any, row: any) => TemplateResult | string;
}

export interface DataTableRow {
  [key: string]: any;
}

@customElement("esphome-data-table")
export class ESPHomeDataTable extends LitElement {
  @property({ attribute: false }) public columns: DataTableColumn[] = [];
  @property({ attribute: false }) public data: DataTableRow[] = [];
  @property() public filter = "";
  @property({ type: Boolean }) public clickable = false;
  @property() public noDataText = "No data";
  @property() private _sortColumn?: string;
  @property() private _sortDirection?: "asc" | "desc";

  private _handleSort(column: DataTableColumn) {
    if (!column.sortable) return;

    if (this._sortColumn === column.key) {
      this._sortDirection = this._sortDirection === "asc" ? "desc" : "asc";
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

  private _handleRowClick(row: DataTableRow) {
    if (!this.clickable) return;
    
    this.dispatchEvent(
      new CustomEvent("row-click", {
        detail: { row },
        bubbles: true,
        composed: true,
      })
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
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              ${this.columns.map(
                (column) => html`
                  <th
                    class=${classMap({
                      sortable: !!column.sortable,
                      sorted: this._sortColumn === column.key,
                      [column.align || "left"]: true,
                    })}
                    style=${column.width ? `width: ${column.width}` : ""}
                    @click=${() => this._handleSort(column)}
                  >
                    <div class="header-content">
                      <span>${column.title}</span>
                      ${column.sortable
                        ? html`
                            <svg
                              class="sort-icon ${this._sortColumn === column.key
                                ? this._sortDirection!
                                : ""}"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M7 10l5 5 5-5"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                              />
                            </svg>
                          `
                        : ""}
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
                  class=${classMap({ clickable: this.clickable })}
                  @click=${() => this._handleRowClick(row)}
                >
                  ${this.columns.map((column) => {
                    const value = row[column.key];
                    const content = column.template
                      ? column.template(value, row)
                      : value;

                    return html`
                      <td class=${column.align || "left"}>
                        ${content}
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

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .table-wrapper {
      width: 100%;
      overflow-x: auto;
      background: var(--esphome-table-background, #ffffff);
      border-radius: var(--esphome-border-radius, 4px);
      box-shadow: var(--esphome-box-shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    thead {
      background: var(--esphome-table-header-background, #fafafa);
      border-bottom: 1px solid var(--esphome-border-color, #e0e0e0);
    }

    th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 500;
      color: var(--esphome-text-secondary, #666666);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      user-select: none;
      white-space: nowrap;
    }

    th.sortable {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    th.sortable:hover {
      background-color: var(--esphome-table-hover, rgba(0, 0, 0, 0.04));
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
      gap: 4px;
    }

    .sort-icon {
      color: var(--esphome-text-secondary, #666666);
      transition: transform 0.2s, opacity 0.2s;
      opacity: 0.3;
    }

    th.sorted .sort-icon {
      opacity: 1;
    }

    .sort-icon.desc {
      transform: rotate(180deg);
    }

    tbody tr {
      border-bottom: 1px solid var(--esphome-border-color, #e0e0e0);
      transition: background-color 0.2s;
    }

    tbody tr:last-child {
      border-bottom: none;
    }

    tbody tr:hover {
      background-color: var(--esphome-table-hover, rgba(0, 0, 0, 0.02));
    }

    tbody tr.clickable {
      cursor: pointer;
    }

    td {
      padding: 12px 16px;
      color: var(--esphome-text-primary, #212121);
      vertical-align: middle;
    }

    td.center {
      text-align: center;
    }

    td.right {
      text-align: right;
    }

    .no-data {
      padding: 48px 24px;
      text-align: center;
      color: var(--esphome-text-secondary, #666666);
      background: var(--esphome-table-background, #ffffff);
      border-radius: var(--esphome-border-radius, 4px);
      box-shadow: var(--esphome-box-shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
    }

    .no-data p {
      margin: 0;
      font-size: 14px;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      :host {
        --esphome-table-background: #1e1e1e;
        --esphome-table-header-background: #2a2a2a;
        --esphome-border-color: #404040;
        --esphome-text-primary: #e0e0e0;
        --esphome-text-secondary: #999999;
        --esphome-table-hover: rgba(255, 255, 255, 0.05);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      th, td {
        padding: 8px 12px;
      }
      
      th {
        font-size: 11px;
      }
      
      td {
        font-size: 13px;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "esphome-data-table": ESPHomeDataTable;
  }
}
