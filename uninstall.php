<?php
/**
 * Uninstall script for Blocksy Fluid Animation plugin
 * 
 * This file is executed when the plugin is uninstalled from WordPress
 */

// Prevent direct access
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Remove plugin options from database
delete_option('blocksy_fluid_animation_options');

// Remove any transients created by the plugin
delete_transient('blocksy_fluid_animation_cache');

// Clean up any scheduled events
wp_clear_scheduled_hook('blocksy_fluid_animation_cleanup');

// Remove any custom database tables if they were created
global $wpdb;

// Example: Drop custom table if it exists
// $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}blocksy_fluid_animation_data");

// Clean up any uploaded files or directories created by the plugin
$upload_dir = wp_upload_dir();
$plugin_upload_path = $upload_dir['basedir'] . '/blocksy-fluid-animation';

if (is_dir($plugin_upload_path)) {
    // Remove plugin upload directory and all contents
    function blocksy_fluid_remove_directory($dir) {
        if (is_dir($dir)) {
            $files = array_diff(scandir($dir), array('.', '..'));
            foreach ($files as $file) {
                $file_path = $dir . DIRECTORY_SEPARATOR . $file;
                if (is_dir($file_path)) {
                    blocksy_fluid_remove_directory($file_path);
                } else {
                    unlink($file_path);
                }
            }
            rmdir($dir);
        }
    }
    
    blocksy_fluid_remove_directory($plugin_upload_path);
}

// Remove any cached data
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
}

// Remove any custom user meta related to the plugin
$users = get_users(array('meta_key' => 'blocksy_fluid_animation_preferences'));
foreach ($users as $user) {
    delete_user_meta($user->ID, 'blocksy_fluid_animation_preferences');
}

// Remove any custom post meta
$posts_with_meta = get_posts(array(
    'numberposts' => -1,
    'meta_key' => 'blocksy_fluid_animation_enabled',
    'fields' => 'ids'
));

foreach ($posts_with_meta as $post_id) {
    delete_post_meta($post_id, 'blocksy_fluid_animation_enabled');
    delete_post_meta($post_id, 'blocksy_fluid_animation_settings');
}

// Remove any custom terms or taxonomies if created
// Example: wp_delete_term($term_id, 'blocksy_fluid_animation_category');

// Log the uninstallation for debugging purposes
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('Blocksy Fluid Animation plugin uninstalled successfully');
}

// Clear any object cache
if (function_exists('wp_cache_delete')) {
    wp_cache_delete('blocksy_fluid_animation_settings', 'options');
}

// Remove any network options if this is a multisite installation
if (is_multisite()) {
    delete_site_option('blocksy_fluid_animation_network_options');
}

// Final cleanup - remove any remaining options that might have been missed
$option_prefix = 'blocksy_fluid_animation_';
$wpdb->query(
    $wpdb->prepare(
        "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
        $wpdb->esc_like($option_prefix) . '%'
    )
);

// If multisite, clean up network options too
if (is_multisite()) {
    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->sitemeta} WHERE meta_key LIKE %s",
            $wpdb->esc_like($option_prefix) . '%'
        )
    );
}

?>
