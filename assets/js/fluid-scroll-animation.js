"use strict";

var targets = document.querySelectorAll("canvas");

var lazyLoad = (target) => {
    var io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                var script = document.createElement('script');
                script.setAttribute('src', target.getAttribute("data-url") + "assets/js/fluid-animation.js");
                script.setAttribute('type', 'text/javascript');
                var loaded = false;
                var loadFunction = function () {
                    if (loaded) return;
                    loaded = true;
                    // Initialize the fluid animation after script loads
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
        rootMargin: '50px'
    });

    io.observe(target);
};

// Initialize lazy loading for all canvas elements
targets.forEach(lazyLoad);

// Fallback for when Intersection Observer is not supported
if (!window.IntersectionObserver) {
    targets.forEach(target => {
        var script = document.createElement('script');
        script.setAttribute('src', target.getAttribute("data-url") + "assets/js/fluid-animation.js");
        script.setAttribute('type', 'text/javascript');
        document.getElementsByTagName("body")[0].appendChild(script);
    });
}

// Performance optimization: pause animation when page is not visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause animation
        if (window.blocksyFluidAnimation && window.blocksyFluidAnimation.pause) {
            window.blocksyFluidAnimation.pause();
        }
    } else {
        // Resume animation
        if (window.blocksyFluidAnimation && window.blocksyFluidAnimation.resume) {
            window.blocksyFluidAnimation.resume();
        }
    }
});
