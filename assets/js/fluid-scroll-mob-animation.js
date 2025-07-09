"use strict";

var targets = document.querySelectorAll("canvas");

var lazyLoad = (target) => {
    var io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                var script = document.createElement('script');
                script.setAttribute('src', target.getAttribute("data-url") + "assets/js/fluid-mob-animation.js");
                script.setAttribute('type', 'text/javascript');
                var loaded = false;
                var loadFunction = function () {
                    if (loaded) return;
                    loaded = true;
                    // Initialize the mobile fluid animation after script loads
                    if (typeof fluid_init === 'function') {
                        fluid_init();
                    }
                };
                script.onload = loadFunction;
                script.onreadystatechange = loadFunction;
                document.getElementsByTagName("body")[0].appendChild(script);
                observer.disconnect();
            }
        });
    }, { 
        threshold: [0.1],
        rootMargin: '100px' // Larger margin for mobile
    });

    io.observe(target);
};

// Initialize lazy loading for all canvas elements
targets.forEach(lazyLoad);

// Fallback for when Intersection Observer is not supported
if (!window.IntersectionObserver) {
    targets.forEach(target => {
        var script = document.createElement('script');
        script.setAttribute('src', target.getAttribute("data-url") + "assets/js/fluid-mob-animation.js");
        script.setAttribute('type', 'text/javascript');
        document.getElementsByTagName("body")[0].appendChild(script);
    });
}

// Mobile-specific optimizations
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause animation on mobile when page is hidden
        if (window.blocksyFluidAnimation && window.blocksyFluidAnimation.pause) {
            window.blocksyFluidAnimation.pause();
        }
    } else {
        // Resume animation when page becomes visible
        if (window.blocksyFluidAnimation && window.blocksyFluidAnimation.resume) {
            window.blocksyFluidAnimation.resume();
        }
    }
});

// Battery optimization for mobile devices
if ('getBattery' in navigator) {
    navigator.getBattery().then(function(battery) {
        function updateBatteryOptimization() {
            if (battery.level < 0.2 || !battery.charging) {
                // Reduce animation quality when battery is low
                if (window.blocksyFluidAnimation && window.blocksyFluidAnimation.setLowPowerMode) {
                    window.blocksyFluidAnimation.setLowPowerMode(true);
                }
            } else {
                // Resume normal quality when battery is sufficient
                if (window.blocksyFluidAnimation && window.blocksyFluidAnimation.setLowPowerMode) {
                    window.blocksyFluidAnimation.setLowPowerMode(false);
                }
            }
        }
        
        battery.addEventListener('chargingchange', updateBatteryOptimization);
        battery.addEventListener('levelchange', updateBatteryOptimization);
        updateBatteryOptimization();
    });
}

// Orientation change handling for mobile
window.addEventListener('orientationchange', function() {
    setTimeout(function() {
        // Reinitialize canvas dimensions after orientation change
        var canvases = document.querySelectorAll('canvas');
        canvases.forEach(function(canvas) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        });
        
        // Trigger resize event for fluid animation
        if (window.blocksyFluidAnimation && window.blocksyFluidAnimation.handleResize) {
            window.blocksyFluidAnimation.handleResize();
        }
    }, 100);
});
