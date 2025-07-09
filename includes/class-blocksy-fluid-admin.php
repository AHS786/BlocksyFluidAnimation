<?php
/**
 * Admin functionality
 */
class Blocksy_Fluid_Admin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_ajax_blocksy_fluid_reset_settings', array($this, 'reset_settings'));
    }
    
    public function add_admin_menu() {
        add_options_page(
            __('Blocksy Fluid Animation', 'blocksy-fluid-animation'),
            __('Fluid Animation', 'blocksy-fluid-animation'),
            'manage_options',
            'blocksy-fluid-animation',
            array($this, 'admin_page')
        );
    }
    
    public function register_settings() {
        register_setting('blocksy_fluid_animation_options', 'blocksy_fluid_animation_options', array($this, 'validate_options'));
    }
    
    public function validate_options($input) {
        $validated = array();
        
        $validated['enabled'] = isset($input['enabled']) ? (bool) $input['enabled'] : false;
        $validated['fluid_bg'] = sanitize_text_field($input['fluid_bg']);
        $validated['sim_resolution'] = absint($input['sim_resolution']);
        $validated['quality'] = absint($input['quality']);
        $validated['mobile_quality'] = absint($input['mobile_quality']);
        $validated['density_dissipation'] = floatval($input['density_dissipation']);
        $validated['vorticity'] = absint($input['vorticity']);
        $validated['splat_radius'] = floatval($input['splat_radius']);
        $validated['transparent'] = isset($input['transparent']) ? (bool) $input['transparent'] : false;
        $validated['bloom'] = isset($input['bloom']) ? (bool) $input['bloom'] : false;
        $validated['bloom_intensity'] = floatval($input['bloom_intensity']);
        $validated['bloom_threshold'] = floatval($input['bloom_threshold']);
        $validated['lazy_load'] = isset($input['lazy_load']) ? (bool) $input['lazy_load'] : false;
        $validated['mobile_detection'] = isset($input['mobile_detection']) ? (bool) $input['mobile_detection'] : false;
        
        return $validated;
    }
    
    public function admin_page() {
        $options = get_option('blocksy_fluid_animation_options', array());
        require_once BLOCKSY_FLUID_ANIMATION_PLUGIN_DIR . 'admin/admin.php';
    }
    
    public function reset_settings() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'blocksy_fluid_animation_nonce')) {
            wp_die(__('Security check failed', 'blocksy-fluid-animation'));
        }
        
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'blocksy-fluid-animation'));
        }
        
        // Reset to default options
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
        
        update_option('blocksy_fluid_animation_options', $default_options);
        
        wp_send_json_success(array('message' => __('Settings reset successfully', 'blocksy-fluid-animation')));
    }
}
?>
