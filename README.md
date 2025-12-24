# Homepage Dashboard

A comprehensive, customizable dashboard application built with Go and vanilla JavaScript. This dashboard provides system monitoring, weather information, GitHub integration, RSS feeds, calendar management, and much more.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Modules](#modules)
- [API Endpoints](#api-endpoints)
- [Themes](#themes)
- [Usage](#usage)
- [Development](#development)

## Features

### Core Features

- **System Monitoring**: Real-time CPU, RAM, and disk usage with historical graphs
- **SMBIOS Integration**: Detailed hardware information (BIOS, System, Baseboard, RAM modules)
- **Weather Integration**: Current conditions and forecasts with support for multiple providers
- **GitHub Integration**: Repository monitoring, pull requests, commits, and issues
- **RSS Feed Reader**: Subscribe to and read RSS feeds
- **Calendar & Events**: Month and week calendar views with event management
- **Todo List**: Task management with priorities
- **Service Monitoring**: Health checks for HTTP/HTTPS services with SSL certificate monitoring
- **SNMP Support**: Query SNMP devices on your network
- **Quick Links**: Customizable bookmark collection with favicon support
- **Search**: Global search with history
- **Drag-and-Drop Layout**: Fully customizable module arrangement with split columns
- **Quick Module Actions**: Drag to left edge to disable, drag to right edge to temporarily pin
- **Theme System**: Multiple themes with color scheme variations

## Installation

### Prerequisites

- Go 1.25.5 or later
- Linux/macOS/Windows

### Build

```bash
go build -o homepage
```

### Run

```bash
./homepage
```

The dashboard will be available at `http://localhost:8080` by default.

## Configuration

### Command Line Flags

- `--port`: Port to listen on (default: `8080`)

### Example

```bash
./homepage --port 8080
```

### Preferences

All configuration is managed through the dashboard's Preferences system:
- **General**: Theme, color scheme, layout settings
- **Weather**: Location, provider, API keys
- **GitHub**: Usernames, organizations, API tokens
- **RSS**: Feed URLs
- **Monitoring**: Service endpoints
- **Modules**: Enable/disable modules, refresh intervals
- **Layout**: Grid configuration, module arrangement

Preferences are stored in browser localStorage and can be exported/imported via the Config tab.

## Modules

### System Modules

#### Status
- System uptime
- Server time (local and UTC)
- Online status indicator

#### CPU
- Real-time CPU usage percentage
- Historical usage graph
- Multi-core support
- Configurable refresh interval (default: 5 seconds)

#### CPU Info
- CPU model and manufacturer
- Architecture and features
- Cache information
- Clock speed

#### RAM
- Memory usage (used, total, available)
- Usage percentage
- Historical usage graph
- Configurable refresh interval (default: 5 seconds)

#### RAM Info
- SMBIOS memory module information
- Module size, speed, type
- Manufacturer and part number
- Serial numbers

#### Disk
- **Multiple disk support**: Monitor multiple disks simultaneously
- Disk usage by mount point
- Free and used space
- Historical usage graph (persisted across page loads)
- Configurable refresh interval via General preferences (default: 15 seconds)
- Add/remove disks via Preferences > Modules > Disk Modules

#### Firmware
- BIOS/Firmware vendor
- Version
- Release date

#### System Info
- SMBIOS System Information
- Manufacturer, product name, version
- Serial number and UUID
- Wake-up type, SKU number, family

#### Baseboard
- SMBIOS Baseboard Information
- Manufacturer, product, version
- Serial number and asset tag
- Location in chassis, board type
- Feature flags

### Network Modules

#### Network
- Local IP addresses with PTR records
- Public IP address with PTR record
- Network interface information
- **PTR caching**: DNS PTR lookups are cached for 1 hour to reduce queries
- Configurable refresh interval (default: 7200 seconds)

### Weather Module

#### Current Weather
- Temperature, humidity, wind speed
- Feels like temperature
- Pressure, wind direction
- UV index, cloud cover
- Visibility, dew point
- Precipitation probability
- Weather condition icon

#### Forecast
- Today's forecast (high/low, precipitation, sunrise/sunset)
- Tomorrow's forecast
- Extended forecast (next 3 days)

#### Weather Providers
- **Open-Meteo** (default, no API key required)
- **OpenWeatherMap** (requires API key)
- **WeatherAPI.com** (requires API key)

### GitHub Modules

#### Repository Monitoring
- User repositories
- Organization repositories
- Repository statistics
- Commit activity
- Pull request status
- Issue tracking
- Configurable number of items per module (1-20, default: 5)
- Rate limit monitoring with caching to prevent excessive API calls
- Optional GitHub token support for higher rate limits

### RSS Module

- Subscribe to multiple RSS feeds
- Feed item display with title, description, and date
- **Image preview**: Hover over titles to see feed images (from enclosure/media:content)
- Configurable number of articles per feed (1-20, default: 5)
- Show/hide title, text, date per feed
- Configurable refresh interval (default: 300 seconds)
- Multiple feed support with individual settings

### Calendar Modules

#### Calendar
- Month view
- Event display
- Navigation controls

#### Week Calendar
- Week view with events
- Event details
- Day-by-day breakdown

#### Upcoming Events
- Next 5 upcoming events
- Event details and dates

### Todo Module

- Task list management
- Priority levels
- Next 5 todos display
- Task completion tracking

### Monitoring Module

- Service health checks
- HTTP/HTTPS endpoint monitoring
- SSL certificate expiration monitoring
- Uptime tracking
- Response time monitoring
- Configurable refresh interval (default: 60 seconds)

### SNMP Module

- SNMP device queries
- OID-based queries
- Community string support
- Configurable refresh interval (default: 60 seconds)

### Quick Links Module

- Customizable bookmark collection
- Icon support (favicon caching)
- Editable via UI
- Quick access to frequently used sites

### Search Module

- Global search functionality
- Search history
- Search history search
- Quick access

## API Endpoints

### System Endpoints

- `GET /api/summary` - Get summary of all modules
- `GET /api/system` - Get system metrics (CPU, RAM, disk)
- `GET /api/cpuid` - Get CPU details
- `GET /api/raminfo` - Get SMBIOS RAM information
- `GET /api/firmware` - Get BIOS/Firmware information
- `GET /api/systeminfo` - Get SMBIOS System information
- `GET /api/baseboard` - Get SMBIOS Baseboard information

### Network Endpoints

- `GET /api/ip` - Get local and public IP addresses
- `GET /api/favicon` - Get favicon for a URL

### Weather Endpoints

- `GET /api/weather?lat={lat}&lon={lon}` - Get weather data
- `GET /api/geocode?q={query}` - Geocode city name to coordinates

### GitHub Endpoints

- `GET /api/github` - Get GitHub repositories
- `GET /api/github/repos?name={name}&type={user|org}&token={token}` - Get repos for user/org
- `GET /api/github/prs?name={name}&type={user|org|repo}&token={token}` - Get pull requests
- `GET /api/github/commits?name={name}&type={user|org|repo}&token={token}` - Get commits
- `GET /api/github/issues?name={name}&type={user|org|repo}&token={token}` - Get issues
- `GET /api/github/stats?name={repo}&token={token}` - Get repository statistics

### Monitoring Endpoints

- `GET /api/monitor` - Get service monitoring status
- `POST /api/monitor` - Add/update monitored service

### SNMP Endpoints

- `GET /api/snmp?host={host}&port={port}&community={community}&oid={oid}` - Query SNMP device

### RSS Endpoints

- `GET /api/rss?url={feedUrl}&count={count}` - Fetch RSS feed (count: 1-20, default 5)

### Configuration Endpoints

- `GET /api/config/list` - List saved configurations
- `GET /api/config/download?name={name}` - Download configuration
- `POST /api/config/upload` - Upload configuration
- `DELETE /api/config/delete?name={name}` - Delete configuration

### Theme Endpoints

- `GET /api/theme?template={template}&scheme={scheme}` - Get theme CSS

### Health Endpoints

- `GET /healthz` - Health check endpoint

## Themes

The dashboard includes multiple themes with various color schemes:

### Available Themes

1. **Nordic** - Clean, modern design with Nordic color palette
2. **Modern** - Contemporary design with smooth gradients
3. **Minimal** - Minimalist design with clean lines
4. **Forest** - Nature-inspired green theme
5. **Ocean** - Blue ocean-inspired theme
6. **Matrix** - Cyberpunk matrix-style theme
7. **Blade Runner** - Neon cyberpunk theme
8. **Alien** - Sci-fi inspired theme

### Color Schemes

Each theme includes multiple color schemes:
- Default
- Dark
- Light (where applicable)
- Various accent color variations

### Theme Customization

- Themes are stored in `templates/*.css`
- Each theme can have multiple color schemes
- Themes use CSS variables for easy customization
- Theme selection is saved in browser localStorage

## Usage

### Module Management

#### Enabling/Disabling Modules

1. Click the gear icon in the footer to open Preferences
2. Navigate to the "Modules" tab
3. Toggle modules on/off
4. Configure refresh intervals for each module

#### Module Layout

- **Drag and Drop**: Click and drag modules by the grip handle to reorder
- **Layout Editor**: Access via Preferences > Layout tab
- **Grid Configuration**: Set number of columns per row
- **Max Width**: Adjust dashboard maximum width percentage

#### Advanced Drag Features

- **Quick Disable**: Drag a module to the left edge of the screen to disable it (removes from layout and preferences)
- **Temporary Pin**: Drag a module to the right edge to pin it temporarily. The pinned module:
  - Stays fixed on screen while you scroll
  - Can be dragged from the pin to a new location
  - Has a close button to unpin without moving
  - If dropped in invalid area, stays pinned instead of disappearing

- **Column Splitting**: Create vertically-stacked modules in a single column:
  1. Drag a module over an existing module's column
  2. Hold for 5 seconds until the split overlay appears
  3. Drop on the top or bottom zone
  4. Both modules now share the column height equally
  - Split modules show as "ModuleA/ModuleB" in the layout editor
  - Drag to empty split slots to fill them
  - Empty split slots can receive drops directly

### Weather Configuration

1. Open Preferences > Weather tab
2. Search for your location
3. Select weather provider
4. Enter API key if required
5. Location is saved in browser localStorage

### GitHub Integration

1. Open Preferences > GitHub tab
2. Add GitHub usernames or organizations
3. Optionally add GitHub token for higher rate limits
4. Repositories are displayed as modules

### RSS Feeds

1. Open Preferences > RSS tab
2. Add RSS feed URLs
3. Feeds are displayed as modules
4. Configure refresh intervals

### Service Monitoring

1. Open Preferences > Monitoring tab
2. Add service URLs
3. Configure check intervals
4. View service status in Monitoring module

### Quick Links

1. Click "Edit" in Quick Links module
2. Add, edit, or delete links
3. Links are saved in browser localStorage
4. Favicons are automatically fetched and cached

### Calendar & Events

1. Calendar displays current month
2. Add events via calendar interface
3. Events are saved in browser localStorage
4. View upcoming events in dedicated module

### Todo List

1. Add todos via Todo module
2. Set priorities (low, medium, high)
3. Mark todos as complete
4. Todos are saved in browser localStorage

### Search

1. Use the search box in the header
2. Search history is automatically saved
3. Access search history by clicking search box
4. Search within search history

### Configuration Management

1. Export configuration: Preferences > Config tab > Download
2. Import configuration: Preferences > Config tab > Upload
3. Saved configurations are listed in the Config tab
4. Configurations include all user preferences and module settings

## Development

### Project Structure

```
homepage/
├── main.go                 # Main application code
├── static/                 # Static assets
│   └── js/                 # JavaScript modules
│       ├── app.js          # Application initialization
│       ├── layout.js       # Layout system
│       ├── preferences.js  # Preferences management
│       └── modules/       # Module-specific code
├── templates/              # HTML and CSS templates
│   ├── index.html         # Main HTML template
│   └── *.css              # Theme CSS files
└── go.mod                  # Go dependencies
```

### Adding a New Module

1. Add module configuration to `static/js/layout.js`:
```javascript
const moduleConfig = {
  mymodule: {
    name: 'My Module',
    icon: 'fa-icon',
    desc: 'Description',
    hasTimer: true,
    timerKey: 'mymodule',
    defaultInterval: 60,
    enabled: true
  }
};
```

2. Create module JavaScript file in `static/js/modules/mymodule.js`
3. Add API endpoint in `main.go` if needed
4. Add module card HTML in `templates/index.html`
5. Register module refresh function in `static/js/app.js`

### Adding a New Theme

1. Create CSS file in `templates/` directory
2. Follow theme structure with CSS variables
3. Add theme metadata comments:
```css
/*
Template: mytheme
Scheme: default
Accent: #FF0000
Display: Default
*/
```

4. Theme will be automatically detected and available in preferences

### Dependencies

Key Go dependencies:
- `github.com/shirou/gopsutil/v3` - System metrics
- `github.com/earentir/gosmbios` - SMBIOS data
- `github.com/earentir/cpuid` - CPU information
- `github.com/gosnmp/gosnmp` - SNMP support
- `github.com/miekg/dns` - DNS lookups

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

## Version

Current version: 0.1.69
