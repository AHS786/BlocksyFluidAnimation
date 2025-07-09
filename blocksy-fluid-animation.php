<?php
/**
 * Plugin Name: Blocksy Fluid Animation
 * Plugin URI: https://example.com/blocksy-fluid-animation
 * Description: WebGL fluid animation integration for Blocksy theme with admin configuration panel
 * Version: 1.0.0
 * Author: Blocksy Team
 * Author URI: https://creativethemes.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: blocksy-fluid-animation
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('BLOCKSY_FLUID_ANIMATION_VERSION', '1.0.0');
define('BLOCKSY_FLUID_ANIMATION_PLUGIN_FILE', __FILE__);
define('BLOCKSY_FLUID_ANIMATION_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BLOCKSY_FLUID_ANIMATION_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once BLOCKSY_FLUID_ANIMATION_PLUGIN_DIR . 'includes/class-blocksy-fluid-animation.php';
require_once BLOCKSY_FLUID_ANIMATION_PLUGIN_DIR . 'includes/class-blocksy-fluid-admin.php';
require_once BLOCKSY_FLUID_ANIMATION_PLUGIN_DIR . 'includes/class-blocksy-fluid-frontend.php';

// Initialize the plugin
function blocksy_fluid_animation_init() {
    new Blocksy_Fluid_Animation();
}
add_action('plugins_loaded', 'blocksy_fluid_animation_init');

// Activation hook
register_activation_hook(__FILE__, 'blocksy_fluid_animation_activate');
function blocksy_fluid_animation_activate() {
    // Set default options
    $default_options = array(
        'enabled' => true,
        'fluid_bg' => '#02030F',
        'sim_resolution' => 128,
        'quality' => 512,
        'mobile_quality' => 256,
        'density_dissipation' => 0.97,
        'vorticity' => 30,
        'splat_radius' => 0.5,
        'transparent' => false,
        'bloom' => true,
        'bloom_intensity' => 0.8,
        'bloom_threshold' => 0.6,
        'lazy_load' => true,
        'mobile_detection' => true
    );
    
    add_option('blocksy_fluid_animation_options', $default_options);
    
    // Clear any cached data
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'blocksy_fluid_animation_deactivate');
function blocksy_fluid_animation_deactivate() {
    // Clear any cached data
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
}

// Check if Blocksy theme is active and provide enhanced integration
function blocksy_fluid_animation_check_theme() {
    $theme = wp_get_theme();
    $is_blocksy = ($theme->get('Name') === 'Blocksy' || $theme->get('Template') === 'blocksy');
    
    if ($is_blocksy) {
        // Enhanced integration for Blocksy theme
        add_action('wp_head', 'blocksy_fluid_animation_theme_integration', 5);
    } else {
        add_action('admin_notices', 'blocksy_fluid_animation_theme_notice');
    }
}
add_action('after_setup_theme', 'blocksy_fluid_animation_check_theme');

function blocksy_fluid_animation_theme_integration() {
    $options = get_option('blocksy_fluid_animation_options', array());
    
    if (!isset($options['enabled']) || !$options['enabled']) {
        return;
    }
    
    echo '<meta name="blocksy-fluid-animation" content="enabled">';
    echo '<style>
    /* Blocksy theme specific styles */
    .blocksy-fluid-animation-enabled #main-container {
        position: relative;
        z-index: 2;
    }
    
    .blocksy-fluid-animation-enabled .ct-header,
    .blocksy-fluid-animation-enabled .ct-footer {
        position: relative;
        z-index: 1000;
    }
    </style>';
}

function blocksy_fluid_animation_theme_notice() {
    ?>
    <div class="notice notice-info is-dismissible">
        <p><?php _e('Blocksy Fluid Animation plugin is optimized for the Blocksy theme but will work with other themes. For best results, consider using the Blocksy theme.', 'blocksy-fluid-animation'); ?></p>
    </div>
    <?php
}
?>
