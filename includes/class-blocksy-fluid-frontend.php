<?php
/**
 * Frontend functionality
 */
class Blocksy_Fluid_Frontend {
    
    public function __construct() {
        add_action('wp_head', array($this, 'add_canvas_element'));
        add_action('wp_footer', array($this, 'add_canvas_script'));
        add_filter('body_class', array($this, 'add_body_class'));
    }
    
    public function add_canvas_element() {
        $options = get_option('blocksy_fluid_animation_options', array());
        
        // Only add if enabled
        if (!isset($options['enabled']) || !$options['enabled']) {
            return;
        }
        
        $canvas_attributes = array(
            'data-fluid-bg' => '#000000',
            'data-sim-resol' => isset($options['sim_resolution']) ? $options['sim_resolution'] : 128,
            'data-quality' => wp_is_mobile() && isset($options['mobile_quality']) ? $options['mobile_quality'] : (isset($options['quality']) ? $options['quality'] : 512),
            'data-density' => isset($options['density_dissipation']) ? $options['density_dissipation'] : 0.97,
            'data-vorticity' => isset($options['vorticity']) ? $options['vorticity'] : 30,
            'data-splat-radius' => isset($options['splat_radius']) ? $options['splat_radius'] : 0.5,
            'data-transparent' => 'false',
            'data-url' => BLOCKSY_FLUID_ANIMATION_PLUGIN_URL
        );
        
        $attributes_string = '';
        foreach ($canvas_attributes as $key => $value) {
            $attributes_string .= ' ' . esc_attr($key) . '="' . esc_attr($value) . '"';
        }
        
        ?>
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Check if canvas already exists
            var existingCanvas = document.querySelector('.blocksy-fluid-canvas');
            if (existingCanvas) {
                // Update existing canvas attributes
                <?php foreach ($canvas_attributes as $key => $value): ?>
                existingCanvas.setAttribute('<?php echo esc_attr($key); ?>', '<?php echo esc_attr($value); ?>');
                <?php endforeach; ?>
                return;
            }
            
            // Create canvas element
            var canvas = document.createElement('canvas');
            canvas.className = 'blocksy-fluid-canvas';
            <?php foreach ($canvas_attributes as $key => $value): ?>
            canvas.setAttribute('<?php echo esc_attr($key); ?>', '<?php echo esc_attr($value); ?>');
            <?php endforeach; ?>
            
            // Add canvas to body or specific container with Elementor support
            var container = document.querySelector('.elementor') || 
                           document.querySelector('.elementor-page') ||
                           document.querySelector('.elementor-default') ||
                           document.querySelector('.blocksy') || 
                           document.body;
            if (container) {
                container.appendChild(canvas);
            }
            
            // Initialize canvas dimensions
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Handle window resize
            window.addEventListener('resize', function() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        });
        </script>
        <?php
    }
    
    public function add_canvas_script() {
        $options = get_option('blocksy_fluid_animation_options', array());
        
        // Only add if enabled
        if (!isset($options['enabled']) || !$options['enabled']) {
            return;
        }
        
        ?>
        <script>
        // Initialize blocksy fluid animation
        window.blocksyFluidOptions = <?php echo json_encode($options); ?>;
        
        // Set ajax flag for animation scripts
        window.ajax_flag = true;
        </script>
        <?php
    }
    
    public function add_body_class($classes) {
        $options = get_option('blocksy_fluid_animation_options', array());
        
        if (isset($options['enabled']) && $options['enabled']) {
            $classes[] = 'blocksy-fluid-animation-enabled';
            
            // Add Elementor specific classes
            if (class_exists('\Elementor\Plugin')) {
                $classes[] = 'blocksy-fluid-elementor-enabled';
            }
        }
        
        return $classes;
    }
}
?>
