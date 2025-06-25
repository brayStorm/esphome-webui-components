import { css } from "lit";

/**
 * Home Assistant theme mapping for ESPHome WebUI Components
 * Maps HA CSS variables to ESPHome component variables
 */
export const haTheme = css`
  :host {
    /* Typography */
    --esphome-font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
    --esphome-font-family-code: var(--ha-font-family-code, "Roboto Mono", monospace);
    
    /* Font Sizes */
    --esphome-font-size-xs: var(--ha-font-size-xs, 10px);
    --esphome-font-size-s: var(--ha-font-size-s, 12px);
    --esphome-font-size-m: var(--ha-font-size-m, 14px);
    --esphome-font-size-l: var(--ha-font-size-l, 16px);
    --esphome-font-size-xl: var(--ha-font-size-xl, 20px);
    
    /* Font Weights */
    --esphome-font-weight-light: var(--ha-font-weight-light, 300);
    --esphome-font-weight-normal: var(--ha-font-weight-normal, 400);
    --esphome-font-weight-medium: var(--ha-font-weight-medium, 500);
    --esphome-font-weight-bold: var(--ha-font-weight-bold, 700);
    
    /* Line Heights */
    --esphome-line-height-condensed: var(--ha-line-height-condensed, 1.2);
    --esphome-line-height-normal: var(--ha-line-height-normal, 1.5);
    --esphome-line-height-expanded: var(--ha-line-height-expanded, 2);
    
    /* Colors - Primary */
    --esphome-primary-color: var(--primary-color, #03a9f4);
    --esphome-accent-color: var(--accent-color, #ff9800);
    
    /* Colors - Text */
    --esphome-text-primary: var(--primary-text-color, #212121);
    --esphome-text-secondary: var(--secondary-text-color, #727272);
    --esphome-text-disabled: var(--disabled-text-color, #bdbdbd);
    
    /* Colors - Background */
    --esphome-background-color: var(--primary-background-color, #fafafa);
    --esphome-card-background: var(--card-background-color, #ffffff);
    --esphome-table-background: var(--data-table-background-color, var(--card-background-color, #ffffff));
    --esphome-table-header-background: var(--data-table-header-background-color, var(--primary-background-color, #fafafa));
    
    /* Colors - Borders */
    --esphome-border-color: var(--divider-color, #e0e0e0);
    --esphome-border-radius: var(--ha-card-border-radius, 12px);
    
    /* Colors - States */
    --esphome-state-active: var(--state-active-color, #ffc107);
    --esphome-state-inactive: var(--state-inactive-color, #9e9e9e);
    --esphome-error-color: var(--error-color, #f44336);
    --esphome-warning-color: var(--warning-color, #ff9800);
    --esphome-success-color: var(--success-color, #4caf50);
    --esphome-info-color: var(--info-color, #03a9f4);
    
    /* Colors - Status (Map to HA state colors) */
    --esphome-status-online: var(--state-active-color, #4caf50);
    --esphome-status-offline: var(--state-unavailable-color, #9e9e9e);
    --esphome-status-discovered: var(--info-color, #03a9f4);
    --esphome-status-updating: var(--warning-color, #ff9800);
    --esphome-status-unknown: var(--state-unknown-color, #9e9e9e);
    
    /* Shadows */
    --esphome-box-shadow: var(--ha-card-box-shadow, none);
    --esphome-menu-shadow: 
      0px 5px 5px -3px rgba(0, 0, 0, 0.2),
      0px 8px 10px 1px rgba(0, 0, 0, 0.14),
      0px 3px 14px 2px rgba(0, 0, 0, 0.12);
    
    /* Spacing */
    --esphome-spacing-xs: 4px;
    --esphome-spacing-s: 8px;
    --esphome-spacing-m: 16px;
    --esphome-spacing-l: 24px;
    --esphome-spacing-xl: 32px;
    
    /* Data Table Specific */
    --esphome-table-row-height: var(--data-table-row-height, 52px);
    --esphome-table-header-height: 56px;
    --esphome-table-cell-padding: 16px;
    --esphome-table-icon-cell-width: 64px;
    --esphome-table-checkbox-cell-width: 60px;
    
    /* Hover States */
    --esphome-hover-background: rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.04);
    --esphome-hover-opacity: 0.12;
    
    /* Focus States */
    --esphome-focus-color: var(--primary-color, #03a9f4);
    --esphome-focus-outline-width: 2px;
    
    /* Transitions */
    --esphome-transition-duration: 200ms;
    --esphome-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Z-index */
    --esphome-z-index-dropdown: 100;
    --esphome-z-index-modal: 200;
    --esphome-z-index-tooltip: 300;
  }
  
  /* Dark theme support */
  @media (prefers-color-scheme: dark) {
    :host {
      --esphome-text-primary: var(--primary-text-color, #ffffff);
      --esphome-text-secondary: var(--secondary-text-color, #b3b3b3);
      --esphome-background-color: var(--primary-background-color, #111111);
      --esphome-card-background: var(--card-background-color, #1c1c1c);
      --esphome-table-background: var(--data-table-background-color, var(--card-background-color, #1c1c1c));
      --esphome-table-header-background: var(--data-table-header-background-color, #202020);
      --esphome-border-color: var(--divider-color, #333333);
      --esphome-hover-background: rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.05);
    }
  }
`;

/**
 * Common styles shared across all components
 */
export const haCommonStyles = css`
  * {
    box-sizing: border-box;
  }
  
  :host {
    font-family: var(--esphome-font-family);
    font-size: var(--esphome-font-size-m);
    line-height: var(--esphome-line-height-normal);
    color: var(--esphome-text-primary);
  }
  
  /* Focus visible styles */
  :focus-visible {
    outline: var(--esphome-focus-outline-width) solid var(--esphome-focus-color);
    outline-offset: 2px;
  }
  
  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--esphome-border-color);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--esphome-text-secondary);
  }
`;