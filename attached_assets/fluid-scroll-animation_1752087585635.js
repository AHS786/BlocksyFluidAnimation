"use strict";

var targets = document.querySelectorAll("canvas");

var lazyLoad = (target) => {
    var io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            var script = document.createElement('script');
            script.setAttribute('src', target.getAttribute("data-url") + "/assets/js/fluid-animation.min.js");
            script.setAttribute('type', 'text/javascript');
            var loaded = false;
            var loadFunction = function () {
                if (loaded) return;
                loaded = true;
            };
            script.onload = loadFunction;
            script.onreadystatechange = loadFunction;
            document.getElementsByTagName("body")[0].appendChild(script);
            observer.disconnect();
        })
    }, { threshold: [1] });

    io.observe(target);
}
targets.forEach(lazyLoad);