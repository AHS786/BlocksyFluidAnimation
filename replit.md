# Blocksy Fluid Animation WordPress Plugin

## Overview

This is a WordPress plugin that adds fluid animation effects to the Blocksy theme. The plugin provides interactive fluid simulations using HTML5 Canvas and WebGL, with separate optimized versions for desktop and mobile devices. It includes an admin interface for configuration and supports lazy loading for performance optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Canvas-based Animation**: Uses HTML5 Canvas with WebGL for fluid simulation rendering
- **Responsive Design**: Separate animation scripts for desktop and mobile devices
- **Lazy Loading**: Intersection Observer API for performance optimization
- **Progressive Enhancement**: Graceful fallbacks for unsupported browsers

### Backend Architecture
- **WordPress Plugin Structure**: Standard WordPress plugin architecture
- **Admin Interface**: WordPress admin panel integration with settings management
- **AJAX Integration**: Asynchronous settings updates and previews

### Performance Optimizations
- **Mobile Detection**: Automatic detection and loading of mobile-optimized animations
- **Lazy Loading**: Scripts only load when canvas elements are visible
- **Minified Assets**: Compressed JavaScript files for production
- **Visibility API**: Pauses animations when page is not visible

## Key Components

### Animation Engine
- **Fluid Simulation**: WebGL-based fluid dynamics simulation
- **Configurable Parameters**: Adjustable resolution, quality, density, vorticity, and visual effects
- **Bloom Effects**: Optional bloom rendering for enhanced visual quality
- **Background Integration**: Transparent or colored background options

### Admin Interface
- **Settings Panel**: Form-based configuration interface
- **Live Preview**: Real-time preview of animation changes
- **Reset Functionality**: Ability to reset all settings to defaults
- **Mobile Settings**: Separate configuration options for mobile devices

### Asset Management
- **Dual Asset Structure**: Separate files for desktop and mobile versions
- **Minified Production Files**: Optimized files in `attached_assets/` directory
- **Development Files**: Unminified source files in `assets/` directory

## Data Flow

1. **Admin Configuration**: Settings are configured through WordPress admin panel
2. **Frontend Rendering**: Canvas elements are injected into pages based on settings
3. **Script Loading**: Appropriate animation scripts are loaded based on device type
4. **Animation Initialization**: Fluid simulation starts when canvas becomes visible
5. **User Interaction**: Mouse/touch events create fluid effects in real-time

## External Dependencies

### Core Technologies
- **WebGL**: For hardware-accelerated graphics rendering
- **HTML5 Canvas**: For 2D and 3D graphics context
- **Intersection Observer API**: For lazy loading implementation
- **jQuery**: For admin interface functionality

### WordPress Integration
- **WordPress Admin API**: For settings management
- **WordPress Enqueue System**: For script and style loading
- **WordPress AJAX**: For asynchronous admin operations

## Deployment Strategy

### File Structure
```
/admin/           - Admin interface files
/assets/          - Development assets
/attached_assets/ - Production/minified assets
```

### Asset Loading Strategy
- **Conditional Loading**: Different scripts based on device type
- **Performance First**: Lazy loading prevents unnecessary resource consumption
- **Fallback Support**: Graceful degradation for older browsers

### WordPress Integration
- **Theme Compatibility**: Designed specifically for Blocksy theme
- **Plugin Standards**: Follows WordPress plugin development guidelines
- **Settings Persistence**: Configuration stored in WordPress options table

### Performance Considerations
- **Mobile Optimization**: Reduced quality settings for mobile devices
- **Resource Management**: Animation pauses when page is not visible
- **Lazy Loading**: Scripts only load when needed
- **Efficient Rendering**: WebGL hardware acceleration when available

### Browser Compatibility
- **Modern Browser Support**: Targets browsers with WebGL support
- **Graceful Degradation**: Fallbacks for browsers without Intersection Observer
- **Mobile Responsiveness**: Optimized touch interactions for mobile devices