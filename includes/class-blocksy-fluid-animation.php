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

        // Elementor integration hooks
        add_action('elementor/frontend/after_enqueue_styles', array($this, 'elementor_enqueue_scripts'));
        add_action('elementor/preview/enqueue_styles', array($this, 'elementor_preview_scripts'));
        
        // Blocksy theme specific hooks
        add_action('blocksy:head:end', array($this, 'add_theme_integration'));
        add_action('blocksy:content:before', array($this, 'ensure_canvas_position'));
        
        // Template hooks for canvas and full width support
        add_action('elementor/page_templates/canvas/before_content', array($this, 'canvas_template_support'));
        add_action('wp_head', array($this, 'add_fullwidth_support'), 20);
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

    public function elementor_enqueue_scripts() {
        $options = get_option('blocksy_fluid_animation_options', array());

        // Only load if enabled and we're in Elementor context
        if (!isset($options['enabled']) || !$options['enabled']) {
            return;
        }

        // Enqueue styles for Elementor
        wp_enqueue_style(
            'blocksy-fluid-animation-elementor',
            BLOCKSY_FLUID_ANIMATION_PLUGIN_URL . 'assets/css/fluid-animation.css',
            array(),
            BLOCKSY_FLUID_ANIMATION_VERSION
        );

        // Add Elementor-specific script
        wp_add_inline_script(
            'blocksy-fluid-animation',
            'window.blocksyFluidElementor = true;'
        );
    }

    public function elementor_preview_scripts() {
        // Load scripts in Elementor preview mode
        wp_enqueue_style(
            'blocksy-fluid-animation-elementor-preview',
            BLOCKSY_FLUID_ANIMATION_PLUGIN_URL . 'assets/css/fluid-animation.css',
            array(),
            BLOCKSY_FLUID_ANIMATION_VERSION
        );
    }

    public function add_theme_integration() {
        $options = get_option('blocksy_fluid_animation_options', array());
        
        if (!isset($options['enabled']) || !$options['enabled']) {
            return;
        }
        
        echo '<style>
        body.blocksy-fluid-animation-enabled {
            background: ' . esc_attr($options['fluid_bg']) . ' !important;
        }
        </style>';
    }
    
    public function ensure_canvas_position() {
        $options = get_option('blocksy_fluid_animation_options', array());
        
        if (!isset($options['enabled']) || !$options['enabled']) {
            return;
        }
        
        echo '<script>
        // Ensure canvas is properly positioned for Blocksy theme
        if (document.querySelector(".blocksy-fluid-canvas")) {
            document.body.classList.add("blocksy-fluid-animation-enabled");
        }
        </script>';
    }
    
    public function canvas_template_support() {
        $options = get_option('blocksy_fluid_animation_options', array());
        
        if (!isset($options['enabled']) || !$options['enabled']) {
            return;
        }
        
        echo '<script>
        // Elementor canvas template support
        document.addEventListener("DOMContentLoaded", function() {
            if (document.body.classList.contains("elementor-template-canvas")) {
                var canvas = document.querySelector(".blocksy-fluid-canvas");
                if (canvas) {
                    canvas.style.zIndex = "1";
                    document.body.style.background = "' . esc_attr($options['fluid_bg']) . '";
                }
            }
        });
        </script>';
    }
    
    public function add_fullwidth_support() {
        $options = get_option('blocksy_fluid_animation_options', array());
        
        if (!isset($options['enabled']) || !$options['enabled']) {
            return;
        }
        
        echo '<style>
        /* Full width and canvas template support */
        .elementor-template-canvas .blocksy-fluid-canvas,
        .elementor-template-full-width .blocksy-fluid-canvas {
            z-index: 1 !important;
        }
        
        .elementor-template-canvas body,
        .elementor-template-full-width body {
            background: ' . esc_attr($options['fluid_bg']) . ' !important;
        }
        
        /* Ensure proper layering */
        .elementor-template-canvas .elementor,
        .elementor-template-full-width .elementor {
            position: relative;
            z-index: 2;
        }
        </style>';
    }

            BLOCKSY_FLUID_ANIMATION_PLUGIN_URL . 'assets/css/fluid-animation.css',
            array(),
            BLOCKSY_FLUID_ANIMATION_VERSION
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