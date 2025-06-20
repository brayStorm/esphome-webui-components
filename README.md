# ESPHome WebUI Components

A component library for ESPHome Dashboard providing enhanced UI components with Home Assistant styling.

This library is designed to be used as a git submodule to extend the ESPHome Dashboard with modern UI components.

## Components

### ESPHome Data Table (`esphome-data-table`)
- Modern data table with Home Assistant styling
- Sorting, filtering, and pagination support
- Responsive design with theme awareness
- Clean, minimal borders and typography

### Status Indicator (`esphome-status-indicator`)
- Colored status dots with text labels
- States: online, offline, discovered, updating, unknown
- Animated updating state
- Consistent with ESPHome design language

### Button Component (`esphome-button`)
- Three variants: primary, secondary, text
- Dense mode for table actions
- Focus and hover states with proper accessibility
- Dark mode support

### Action Menu (`esphome-action-menu`)
- Dropdown menu with icon support
- Menu dividers and destructive action styling
- Click-outside handling and smooth animations
- Keyboard navigation support

## Usage as Submodule

Add this library as a submodule to your ESPHome Dashboard project:

```bash
# In your ESPHome Dashboard project
git submodule add https://github.com/esphome/esphome-webui-components.git
git submodule update --init --recursive
```

Import components using the configured path alias:

```typescript
import { ESPHomeDataTable } from '@esphome-webui/esphome-data-table';
import { ESPHomeStatusIndicator } from '@esphome-webui/esphome-status-indicator';
```

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development with watch mode
npm run dev

# Type checking
npm run type-check
```

## Integration

When used as a submodule, the parent project's build system automatically:

1. Detects the submodule presence
2. Installs component dependencies
3. Builds the component library
4. Includes components in the main build

No manual integration steps required - components are available immediately after submodule setup.

## Theming

Components use CSS custom properties for theming, compatible with:
- Home Assistant themes
- ESPHome Dashboard themes
- Material Design principles
- Light and dark mode support

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Modern browsers with full Web Components support.

## License

Apache-2.0
