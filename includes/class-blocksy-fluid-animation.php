<?php
/**
 * Main plugin class
 */
class Blocksy_Fluid_Animation {
    
    private $admin;
    private $frontend;
    
    public function __construct() {
        $this->init_hooks();
        $this->load_dependencies();
    }
    
    private function init_hooks() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    }
    
    private function load_dependencies() {
        $this->admin = new Blocksy_Fluid_Admin();
        $this->frontend = new Blocksy_Fluid_Frontend();
    }
    
    public function init() {
        // Load text domain
        load_plugin_textdomain('blocksy-fluid-animation', false, dirname(plugin_basename(BLOCKSY_FLUID_ANIMATION_PLUGIN_FILE)) . '/languages');
    }
    
    public function enqueue_scripts() {
        $options = get_option('blocksy_fluid_animation_options', array());
        
        // Only load if enabled
        if (!isset($options['enabled']) || !$options['enabled']) {
            return;
        }
        
        // Enqueue CSS
        wp_enqueue_style(
            'blocksy-fluid-animation',
            BLOCKSY_FLUID_ANIMATION_PLUGIN_URL . 'assets/css/fluid-animation.css',
            array(),
            BLOCKSY_FLUID_ANIMATION_VERSION
        );
        
        // Enqueue JavaScript based on settings
        if (isset($options['lazy_load']) && $options['lazy_load']) {
            // Use lazy loading
            if (isset($options['mobile_detection']) && $options['mobile_detection']) {
                wp_enqueue_script(
                    'blocksy-fluid-scroll-mob-animation',
                    BLOCKSY_FLUID_ANIMATION_PLUGIN_URL . 'assets/js/fluid-scroll-mob-animation.js',
                    array(),
                    BLOCKSY_FLUID_ANIMATION_VERSION,
                    true
                );
            }
            
            wp_enqueue_script(
                'blocksy-fluid-scroll-animation',
                BLOCKSY_FLUID_ANIMATION_PLUGIN_URL . 'assets/js/fluid-scroll-animation.js',
                array(),
                BLOCKSY_FLUID_ANIMATION_VERSION,
                true
            );
        } else {
            // Load immediately
            if (wp_is_mobile() && isset($options['mobile_detection']) && $options['mobile_detection']) {
                wp_enqueue_script(
                    'blocksy-fluid-mob-animation',
                    BLOCKSY_FLUID_ANIMATION_PLUGIN_URL . 'assets/js/fluid-mob-animation.js',
                    array(),
                    BLOCKSY_FLUID_ANIMATION_VERSION,
                    true
                );
            } else {
                wp_enqueue_script(
                    'blocksy-fluid-animation',
                    BLOCKSY_FLUID_ANIMATION_PLUGIN_URL . 'assets/js/fluid-animation.js',
                    array(),
                    BLOCKSY_FLUID_ANIMATION_VERSION,
                    true
                );
            }
        }
        
        // Pass data to JavaScript
        wp_localize_script(
            'blocksy-fluid-animation',
            'blocksyFluidAnimation',
            array(
                'pluginUrl' => BLOCKSY_FLUID_ANIMATION_PLUGIN_URL,
                'options' => $options,
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('blocksy_fluid_animation_nonce')
            )
        );
    }
    
    public function admin_enqueue_scripts($hook) {
        if ('settings_page_blocksy-fluid-animation' !== $hook) {
            return;
        }
        
        wp_enqueue_style(
            'blocksy-fluid-admin',
            BLOCKSY_FLUID_ANIMATION_PLUGIN_URL . 'admin/admin.css',
            array(),
            BLOCKSY_FLUID_ANIMATION_VERSION
        );
        
        wp_enqueue_script(
            'blocksy-fluid-admin',
            BLOCKSY_FLUID_ANIMATION_PLUGIN_URL . 'admin/admin.js',
            array('jquery'),
            BLOCKSY_FLUID_ANIMATION_VERSION,
            true
        );
    }
    
    public static function get_options() {
        return get_option('blocksy_fluid_animation_options', array());
    }
    
    public static function update_options($options) {
        return update_option('blocksy_fluid_animation_options', $options);
    }
}
?>
