<?php
// Simple WordPress plugin test environment
define('WP_DEBUG', true);
define('ABSPATH', dirname(__FILE__) . '/');

// Mock WordPress functions for testing
function wp_enqueue_script($handle, $src = '', $deps = array(), $ver = false, $in_footer = false) {
    echo "<script src='{$src}' type='text/javascript'></script>\n";
}

function wp_enqueue_style($handle, $src = '', $deps = array(), $ver = false, $media = 'all') {
    echo "<link rel='stylesheet' href='{$src}' type='text/css' media='{$media}' />\n";
}

function wp_localize_script($handle, $object_name, $l10n) {
    echo "<script type='text/javascript'>\n";
    echo "var {$object_name} = " . json_encode($l10n) . ";\n";
    echo "</script>\n";
}

function plugin_dir_url($file) {
    return str_replace($_SERVER['DOCUMENT_ROOT'], '', dirname($file)) . '/';
}

function plugin_dir_path($file) {
    return dirname($file) . '/';
}

function get_option($option, $default = false) {
    // Mock options for testing
    if ($option === 'blocksy_fluid_animation_options') {
        return array(
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
    }
    return $default;
}

function wp_is_mobile() {
    return preg_match('/(android|iphone|ipad|ipod|mobile)/i', $_SERVER['HTTP_USER_AGENT']);
}

function add_action($hook, $function_to_add, $priority = 10, $accepted_args = 1) {
    if ($hook === 'wp_head') {
        call_user_func($function_to_add);
    }
    if ($hook === 'wp_footer') {
        call_user_func($function_to_add);
    }
}

function add_filter($tag, $function_to_add, $priority = 10, $accepted_args = 1) {
    // Mock filter handling
}

function register_activation_hook($file, $function) {
    // Mock activation hook - call the function immediately for testing
    call_user_func($function);
}

function register_deactivation_hook($file, $function) {
    // Mock deactivation hook
}

function add_option($option, $value) {
    // Mock add option
    return true;
}

function update_option($option, $value) {
    // Mock update option
    return true;
}

function wp_cache_flush() {
    // Mock cache flush
    return true;
}

function load_plugin_textdomain($domain, $deprecated = false, $plugin_rel_path = false) {
    // Mock text domain loading
    return true;
}

function wp_create_nonce($action = -1) {
    // Mock nonce creation
    return 'mock_nonce_' . md5($action);
}

function admin_url($path = '', $scheme = 'admin') {
    // Mock admin URL
    return 'http://localhost:5000/wp-admin/' . $path;
}



function __($text, $domain = 'default') {
    // Mock translation
    return $text;
}

function _e($text, $domain = 'default') {
    // Mock translation echo
    echo $text;
}

function esc_attr($text) {
    return htmlspecialchars($text, ENT_QUOTES);
}



// Include the plugin
require_once 'blocksy-fluid-animation.php';

// Initialize the plugin
blocksy_fluid_animation_init();

// Get the frontend class instance
$frontend = new Blocksy_Fluid_Frontend();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blocksy Fluid Animation Plugin Test</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            min-height: 100vh;
            background: #1a1a1a;
            color: #fff;
        }
        .blocksy {
            position: relative;
            min-height: 100vh;
            z-index: 1;
        }
        .content {
            position: relative;
            z-index: 2;
            padding: 50px;
            text-align: center;
        }
        .content h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }
        .content p {
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.8;
        }
        .demo-button {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 15px 30px;
            font-size: 1.1em;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 10px;
            display: inline-block;
        }
        .demo-button:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
        }
        .blocksy-boom {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            border: none;
            color: white;
            font-weight: bold;
        }
        .info-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
            font-size: 0.9em;
            max-width: 300px;
        }
        .info-panel h3 {
            margin-top: 0;
            color: #4ecdc4;
        }
        .info-panel ul {
            list-style: none;
            padding: 0;
        }
        .info-panel li {
            padding: 5px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .info-panel li:last-child {
            border-bottom: none;
        }
        .canvas-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        }
        canvas {
            width: 100%;
            height: 100%;
            display: block;
        }
    </style>
    <?php
    // Load CSS
    wp_enqueue_style('blocksy-fluid-animation', plugin_dir_url(__FILE__) . 'assets/css/fluid-animation.css');
    
    // Add canvas element
    $frontend->add_canvas_element();
    ?>
</head>
<body class="blocksy blocksy-fluid-animation-enabled">
    <div class="canvas-container">
        <canvas class="blocksy-fluid-canvas" 
                data-fluid-bg="#02030F" 
                data-sim-resol="128" 
                data-quality="512" 
                data-density="0.97" 
                data-vorticity="30" 
                data-splat-radius="0.5" 
                data-transparent="false" 
                data-url="<?php echo plugin_dir_url(__FILE__); ?>">
        </canvas>
    </div>
    
    <div class="blocksy">
        <div class="content">
            <h1>Blocksy Fluid Animation</h1>
            <p>Move your mouse or touch the screen to interact with the WebGL fluid simulation</p>
            <button class="demo-button blocksy-boom">Create Explosion</button>
            <button class="demo-button" onclick="toggleAnimation()">Toggle Animation</button>
            <button class="demo-button" onclick="changeBackground()">Change Background</button>
        </div>
        
        <div class="info-panel">
            <h3>Plugin Features</h3>
            <ul>
                <li>✓ WebGL Fluid Simulation</li>
                <li>✓ Blocksy Theme Integration</li>
                <li>✓ Mobile Optimized</li>
                <li>✓ Lazy Loading</li>
                <li>✓ Admin Configuration</li>
                <li>✓ Bloom Effects</li>
                <li>✓ Touch Support</li>
                <li>✓ Performance Optimized</li>
            </ul>
        </div>
    </div>
    
    <script>
        window.ajax_flag = true;
        
        function toggleAnimation() {
            const canvas = document.querySelector('canvas');
            if (canvas.style.display === 'none') {
                canvas.style.display = 'block';
            } else {
                canvas.style.display = 'none';
            }
        }
        
        function changeBackground() {
            const colors = ['#02030F', '#1a0033', '#330033', '#003366', '#001a33'];
            const canvas = document.querySelector('canvas');
            const currentBg = canvas.getAttribute('data-fluid-bg');
            const currentIndex = colors.indexOf(currentBg);
            const nextIndex = (currentIndex + 1) % colors.length;
            canvas.setAttribute('data-fluid-bg', colors[nextIndex]);
            
            // Reinitialize if needed
            if (typeof fluid_init === 'function') {
                fluid_init();
            }
        }
        
        // Initialize canvas dimensions
        function initCanvas() {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        }
        
        // Handle window resize
        window.addEventListener('resize', initCanvas);
        window.addEventListener('load', initCanvas);
        
        // Initialize canvas immediately
        initCanvas();
    </script>
    
    <?php
    // Load JavaScript
    if (wp_is_mobile()) {
        wp_enqueue_script('blocksy-fluid-mob-animation', plugin_dir_url(__FILE__) . 'assets/js/fluid-mob-animation.js', array(), '1.0.0', true);
    } else {
        wp_enqueue_script('blocksy-fluid-animation', plugin_dir_url(__FILE__) . 'assets/js/fluid-animation.js', array(), '1.0.0', true);
    }
    
    // Add footer script
    $frontend->add_canvas_script();
    ?>
</body>
</html>