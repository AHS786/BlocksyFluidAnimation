jQuery(document).ready(function($) {
    'use strict';
    
    // Initialize admin functionality
    initializeAdmin();
    
    function initializeAdmin() {
        // Handle reset settings button
        $('#reset-settings').on('click', function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to reset all settings to default values?')) {
                resetSettings();
            }
        });
        
        // Handle form changes for live preview
        $('input[type="number"], input[type="color"], input[type="checkbox"]').on('change', function() {
            updatePreview();
        });
        
        // Initialize preview
        updatePreview();
        
        // Handle mobile detection toggle
        $('#mobile_detection').on('change', function() {
            toggleMobileSettings($(this).is(':checked'));
        });
        
        // Handle bloom effect toggle
        $('#bloom').on('change', function() {
            toggleBloomSettings($(this).is(':checked'));
        });
        
        // Initial state
        toggleMobileSettings($('#mobile_detection').is(':checked'));
        toggleBloomSettings($('#bloom').is(':checked'));
    }
    
    function resetSettings() {
        var $button = $('#reset-settings');
        var originalText = $button.text();
        
        $button.text('Resetting...').prop('disabled', true);
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'blocksy_fluid_reset_settings',
                nonce: $('#_wpnonce').val()
            },
            success: function(response) {
                if (response.success) {
                    showMessage('Settings reset successfully!', 'success');
                    // Reload page to show default values
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                } else {
                    showMessage('Error resetting settings', 'error');
                }
            },
            error: function() {
                showMessage('Error resetting settings', 'error');
            },
            complete: function() {
                $button.text(originalText).prop('disabled', false);
            }
        });
    }
    
    function updatePreview() {
        var canvas = document.getElementById('preview-canvas');
        if (!canvas) return;
        
        var options = getFormOptions();
        
        // Set canvas attributes
        canvas.setAttribute('data-fluid-bg', options.fluid_bg);
        canvas.setAttribute('data-sim-resol', options.sim_resolution);
        canvas.setAttribute('data-quality', options.quality);
        canvas.setAttribute('data-density', options.density_dissipation);
        canvas.setAttribute('data-vorticity', options.vorticity);
        canvas.setAttribute('data-splat-radius', options.splat_radius);
        canvas.setAttribute('data-transparent', options.transparent);
        
        // Reinitialize canvas if needed
        if (typeof initPreviewCanvas === 'function') {
            initPreviewCanvas(canvas, options);
        }
    }
    
    function getFormOptions() {
        return {
            enabled: $('#enabled').is(':checked'),
            fluid_bg: $('#fluid_bg').val(),
            sim_resolution: parseInt($('#sim_resolution').val()),
            quality: parseInt($('#quality').val()),
            mobile_quality: parseInt($('#mobile_quality').val()),
            density_dissipation: parseFloat($('#density_dissipation').val()),
            vorticity: parseInt($('#vorticity').val()),
            splat_radius: parseFloat($('#splat_radius').val()),
            transparent: $('#transparent').is(':checked'),
            bloom: $('#bloom').is(':checked'),
            bloom_intensity: parseFloat($('#bloom_intensity').val()),
            bloom_threshold: parseFloat($('#bloom_threshold').val()),
            lazy_load: $('#lazy_load').is(':checked'),
            mobile_detection: $('#mobile_detection').is(':checked')
        };
    }
    
    function toggleMobileSettings(enabled) {
        var $mobileQuality = $('#mobile_quality').closest('tr');
        
        if (enabled) {
            $mobileQuality.show();
        } else {
            $mobileQuality.hide();
        }
    }
    
    function toggleBloomSettings(enabled) {
        var $bloomIntensity = $('#bloom_intensity').closest('tr');
        var $bloomThreshold = $('#bloom_threshold').closest('tr');
        
        if (enabled) {
            $bloomIntensity.show();
            $bloomThreshold.show();
        } else {
            $bloomIntensity.hide();
            $bloomThreshold.hide();
        }
    }
    
    function showMessage(message, type) {
        var messageHtml = '<div class="blocksy-fluid-message ' + type + '">' + message + '</div>';
        
        // Remove existing messages
        $('.blocksy-fluid-message').remove();
        
        // Add new message
        $('.blocksy-fluid-admin-container').prepend(messageHtml);
        
        // Auto-hide after 5 seconds
        setTimeout(function() {
            $('.blocksy-fluid-message').fadeOut(function() {
                $(this).remove();
            });
        }, 5000);
    }
    
    // Form validation
    function validateForm() {
        var isValid = true;
        
        // Validate numeric inputs
        $('input[type="number"]').each(function() {
            var $input = $(this);
            var value = parseFloat($input.val());
            var min = parseFloat($input.attr('min'));
            var max = parseFloat($input.attr('max'));
            
            if (isNaN(value) || value < min || value > max) {
                $input.addClass('error');
                isValid = false;
            } else {
                $input.removeClass('error');
            }
        });
        
        // Validate color inputs
        $('input[type="color"]').each(function() {
            var $input = $(this);
            var value = $input.val();
            
            if (!/^#[0-9A-F]{6}$/i.test(value)) {
                $input.addClass('error');
                isValid = false;
            } else {
                $input.removeClass('error');
            }
        });
        
        return isValid;
    }
    
    // Auto-save draft functionality
    var autoSaveTimer;
    $('input').on('input', function() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
            if (validateForm()) {
                // Could implement auto-save here if needed
                console.log('Form is valid, ready for auto-save');
            }
        }, 1000);
    });
    
    // Export/Import settings functionality
    $('#export-settings').on('click', function(e) {
        e.preventDefault();
        
        var settings = getFormOptions();
        var dataStr = JSON.stringify(settings, null, 2);
        var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        var exportFileDefaultName = 'blocksy-fluid-animation-settings.json';
        
        var linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });
    
    $('#import-settings').on('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var settings = JSON.parse(e.target.result);
                applySettings(settings);
                showMessage('Settings imported successfully!', 'success');
            } catch (error) {
                showMessage('Error importing settings: Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    });
    
    function applySettings(settings) {
        Object.keys(settings).forEach(function(key) {
            var $input = $('#' + key);
            if ($input.length) {
                if ($input.attr('type') === 'checkbox') {
                    $input.prop('checked', settings[key]);
                } else {
                    $input.val(settings[key]);
                }
            }
        });
        
        // Update dependent settings
        toggleMobileSettings(settings.mobile_detection);
        toggleBloomSettings(settings.bloom);
        updatePreview();
    }
});
