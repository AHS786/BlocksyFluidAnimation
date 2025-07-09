
<?php
/**
 * Demo page for Blocksy Fluid Animation
 * 
 * This file demonstrates the plugin integration with Blocksy theme
 */

// Ensure this is run within WordPress
if (!defined('ABSPATH')) {
    exit;
}

get_header(); ?>

<div class="ct-container" style="position: relative; z-index: 2;">
    <div class="ct-content-area">
        <main class="ct-main-content">
            <article class="ct-article">
                <header class="entry-header">
                    <h1 class="entry-title" style="color: white; text-shadow: 0 0 20px rgba(255,255,255,0.5);">
                        Blocksy Fluid Animation Demo
                    </h1>
                </header>
                
                <div class="entry-content" style="color: rgba(255,255,255,0.9);">
                    <div style="text-align: center; padding: 80px 20px;">
                        <h2 style="color: white; margin-bottom: 30px;">Interactive Fluid Animation</h2>
                        <p style="font-size: 1.2em; margin-bottom: 40px;">
                            Move your mouse or touch the screen to interact with the WebGL fluid simulation.
                            The animation works seamlessly with Blocksy theme and Elementor.
                        </p>
                        
                        <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 40px 0;">
                            <button class="wp-element-button" onclick="createExplosion()" 
                                    style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); border: none; padding: 15px 30px; border-radius: 30px; color: white; font-weight: bold; cursor: pointer;">
                                Create Explosion
                            </button>
                            <button class="wp-element-button" onclick="toggleAnimation()" 
                                    style="background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); padding: 15px 30px; border-radius: 30px; color: white; cursor: pointer;">
                                Toggle Animation
                            </button>
                            <button class="wp-element-button" onclick="changeBackground()" 
                                    style="background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); padding: 15px 30px; border-radius: 30px; color: white; cursor: pointer;">
                                Change Background
                            </button>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.3); padding: 30px; border-radius: 15px; margin: 40px 0; backdrop-filter: blur(10px);">
                            <h3 style="color: #4ecdc4; margin-top: 0;">Plugin Features</h3>
                            <ul style="list-style: none; padding: 0; text-align: left; max-width: 400px; margin: 0 auto;">
                                <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">✓ WebGL Fluid Simulation</li>
                                <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">✓ Blocksy Theme Integration</li>
                                <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">✓ Elementor Compatible</li>
                                <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">✓ Mobile Optimized</li>
                                <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">✓ Admin Configuration</li>
                                <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">✓ Touch Support</li>
                                <li style="padding: 8px 0;">✓ Performance Optimized</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </article>
        </main>
    </div>
</div>

<script>
function createExplosion() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    if (window.addFluidSplat && typeof window.addFluidSplat === 'function') {
        // Create multiple splats for explosion effect
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const offsetX = (Math.random() - 0.5) * 200;
                const offsetY = (Math.random() - 0.5) * 200;
                window.addFluidSplat(centerX + offsetX, centerY + offsetY, true);
            }, i * 100);
        }
    }
}

function toggleAnimation() {
    const canvas = document.querySelector('.blocksy-fluid-canvas');
    if (canvas) {
        if (canvas.style.display === 'none') {
            canvas.style.display = 'block';
        } else {
            canvas.style.display = 'none';
        }
    }
}

function changeBackground() {
    const colors = ['#02030F', '#1a0033', '#330033', '#003366', '#001a33'];
    const canvas = document.querySelector('.blocksy-fluid-canvas');
    if (canvas) {
        const currentBg = canvas.getAttribute('data-fluid-bg');
        const currentIndex = colors.indexOf(currentBg);
        const nextIndex = (currentIndex + 1) % colors.length;
        canvas.setAttribute('data-fluid-bg', colors[nextIndex]);
        document.body.style.background = colors[nextIndex];
        
        // Reinitialize if needed
        if (typeof fluid_init === 'function') {
            fluid_init();
        }
    }
}

// Auto-create occasional splats for demo
setInterval(function() {
    if (Math.random() < 0.1) { // 10% chance every second
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        if (window.addFluidSplat && typeof window.addFluidSplat === 'function') {
            window.addFluidSplat(x, y);
        }
    }
}, 1000);
</script>

<?php get_footer(); ?>
