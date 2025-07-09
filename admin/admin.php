<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="blocksy-fluid-admin-container">
        <form method="post" action="options.php">
            <?php
            settings_fields('blocksy_fluid_animation_options');
            do_settings_sections('blocksy_fluid_animation_options');
            ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="enabled"><?php _e('Enable Animation', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="checkbox" id="enabled" name="blocksy_fluid_animation_options[enabled]" value="1" <?php checked(isset($options['enabled']) && $options['enabled']); ?>>
                        <p class="description"><?php _e('Enable or disable the fluid animation', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="fluid_bg"><?php _e('Background Color', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="color" id="fluid_bg" name="blocksy_fluid_animation_options[fluid_bg]" value="<?php echo esc_attr(isset($options['fluid_bg']) ? $options['fluid_bg'] : '#02030F'); ?>" class="color-picker">
                        <p class="description"><?php _e('Set the background color for the fluid animation', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="sim_resolution"><?php _e('Simulation Resolution', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="sim_resolution" name="blocksy_fluid_animation_options[sim_resolution]" value="<?php echo esc_attr(isset($options['sim_resolution']) ? $options['sim_resolution'] : 128); ?>" min="64" max="512" step="1">
                        <p class="description"><?php _e('Higher values provide better quality but may impact performance', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="quality"><?php _e('Quality (Desktop)', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="quality" name="blocksy_fluid_animation_options[quality]" value="<?php echo esc_attr(isset($options['quality']) ? $options['quality'] : 512); ?>" min="128" max="1024" step="1">
                        <p class="description"><?php _e('Display quality for desktop devices', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="mobile_quality"><?php _e('Quality (Mobile)', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="mobile_quality" name="blocksy_fluid_animation_options[mobile_quality]" value="<?php echo esc_attr(isset($options['mobile_quality']) ? $options['mobile_quality'] : 256); ?>" min="128" max="512" step="1">
                        <p class="description"><?php _e('Display quality for mobile devices', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="density_dissipation"><?php _e('Density Dissipation', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="density_dissipation" name="blocksy_fluid_animation_options[density_dissipation]" value="<?php echo esc_attr(isset($options['density_dissipation']) ? $options['density_dissipation'] : 0.97); ?>" min="0.1" max="1.0" step="0.01">
                        <p class="description"><?php _e('How quickly the fluid colors fade (0.1 = fast fade, 1.0 = no fade)', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="vorticity"><?php _e('Vorticity', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="vorticity" name="blocksy_fluid_animation_options[vorticity]" value="<?php echo esc_attr(isset($options['vorticity']) ? $options['vorticity'] : 30); ?>" min="0" max="100" step="1">
                        <p class="description"><?php _e('Controls the curl/swirl effect in the fluid', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="splat_radius"><?php _e('Splat Radius', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="splat_radius" name="blocksy_fluid_animation_options[splat_radius]" value="<?php echo esc_attr(isset($options['splat_radius']) ? $options['splat_radius'] : 0.5); ?>" min="0.1" max="2.0" step="0.1">
                        <p class="description"><?php _e('Size of the color splats when interacting', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="transparent"><?php _e('Transparent Background', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="checkbox" id="transparent" name="blocksy_fluid_animation_options[transparent]" value="1" <?php checked(isset($options['transparent']) && $options['transparent']); ?>>
                        <p class="description"><?php _e('Enable transparent background', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="bloom"><?php _e('Bloom Effect', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="checkbox" id="bloom" name="blocksy_fluid_animation_options[bloom]" value="1" <?php checked(isset($options['bloom']) && $options['bloom']); ?>>
                        <p class="description"><?php _e('Enable bloom lighting effect', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="bloom_intensity"><?php _e('Bloom Intensity', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="bloom_intensity" name="blocksy_fluid_animation_options[bloom_intensity]" value="<?php echo esc_attr(isset($options['bloom_intensity']) ? $options['bloom_intensity'] : 0.8); ?>" min="0.1" max="2.0" step="0.1">
                        <p class="description"><?php _e('Intensity of the bloom effect', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="bloom_threshold"><?php _e('Bloom Threshold', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="bloom_threshold" name="blocksy_fluid_animation_options[bloom_threshold]" value="<?php echo esc_attr(isset($options['bloom_threshold']) ? $options['bloom_threshold'] : 0.6); ?>" min="0.1" max="1.0" step="0.1">
                        <p class="description"><?php _e('Threshold for bloom effect activation', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="lazy_load"><?php _e('Lazy Loading', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="checkbox" id="lazy_load" name="blocksy_fluid_animation_options[lazy_load]" value="1" <?php checked(isset($options['lazy_load']) && $options['lazy_load']); ?>>
                        <p class="description"><?php _e('Enable lazy loading for better performance', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="mobile_detection"><?php _e('Mobile Detection', 'blocksy-fluid-animation'); ?></label>
                    </th>
                    <td>
                        <input type="checkbox" id="mobile_detection" name="blocksy_fluid_animation_options[mobile_detection]" value="1" <?php checked(isset($options['mobile_detection']) && $options['mobile_detection']); ?>>
                        <p class="description"><?php _e('Use optimized version for mobile devices', 'blocksy-fluid-animation'); ?></p>
                    </td>
                </tr>
            </table>
            
            <div class="blocksy-fluid-admin-actions">
                <?php submit_button(__('Save Settings', 'blocksy-fluid-animation'), 'primary'); ?>
                <button type="button" id="reset-settings" class="button button-secondary"><?php _e('Reset to Defaults', 'blocksy-fluid-animation'); ?></button>
            </div>
        </form>
        
        <div class="blocksy-fluid-preview">
            <h3><?php _e('Preview', 'blocksy-fluid-animation'); ?></h3>
            <div class="preview-container">
                <canvas id="preview-canvas" class="blocksy-preview-canvas"></canvas>
            </div>
        </div>
    </div>
</div>
