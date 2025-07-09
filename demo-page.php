
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fluid Animation Demo</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            font-family: Arial, sans-serif;
            overflow-x: hidden;
        }
        .content {
            position: relative;
            z-index: 10;
            color: white;
            padding: 50px;
            text-align: center;
        }
        .demo-section {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
        }
        p {
            font-size: 1.2em;
            max-width: 600px;
            line-height: 1.6;
        }
    </style>
    <!-- Include fluid animation CSS -->
    <link rel="stylesheet" href="assets/css/fluid-animation.css">
</head>
<body class="blocksy-fluid-animation-enabled">
    <!-- Canvas for fluid animation -->
    <canvas class="blocksy-fluid-canvas" 
            data-fluid-bg="#000000"
            data-sim-resol="128"
            data-quality="512"
            data-density="0.97"
            data-vorticity="30"
            data-splat-radius="0.5"
            data-transparent="false"
            data-url="./"></canvas>

    <div class="content">
        <div class="demo-section">
            <h1>Fluid Animation Demo</h1>
            <p>Move your mouse around to interact with the fluid animation. The dark background with flowing colors should respond to your cursor movements.</p>
        </div>
        
        <div class="demo-section">
            <h1>Interactive Experience</h1>
            <p>The animation uses WebGL to create realistic fluid dynamics. Try clicking and dragging to see different effects.</p>
        </div>
        
        <div class="demo-section">
            <h1>Responsive Design</h1>
            <p>This animation is optimized for both desktop and mobile devices, with different quality settings for optimal performance.</p>
        </div>
    </div>

    <!-- Include fluid animation JavaScript -->
    <script>
        window.ajax_flag = true;
        window.blocksyFluidOptions = {
            enabled: true,
            fluid_bg: '#000000',
            sim_resolution: 128,
            quality: 512,
            mobile_quality: 256,
            density_dissipation: 0.97,
            vorticity: 30,
            splat_radius: 0.5,
            transparent: false,
            bloom: true,
            bloom_intensity: 0.8,
            bloom_threshold: 0.6
        };
    </script>
    <script src="assets/js/fluid-animation.js"></script>
    
    <script>
        // Initialize canvas dimensions
        document.addEventListener('DOMContentLoaded', function() {
            var canvas = document.querySelector('.blocksy-fluid-canvas');
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                
                window.addEventListener('resize', function() {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                });
            }
        });
    </script>
</body>
</html>
