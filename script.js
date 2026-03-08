// Starfield Canvas Animation
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
let stars = [];
let mouseX = 0;
let mouseY = 0;
let scrollY = 0;

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Star Class
class Star {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // Initial random position
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.5 + 0.1;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
    }

    update() {
        // Parallax effect based on scroll
        this.y -= this.speedY + (scrollY * 0.001);
        this.x += this.speedX + (mouseX - canvas.width / 2) * 0.0001 * this.size;
        
        // Twinkle effect
        this.twinklePhase += this.twinkleSpeed;
        const twinkle = Math.sin(this.twinklePhase) * 0.3 + 0.7;
        
        // Reset if off screen
        if (this.y < -10) {
            this.reset();
        }
        if (this.x < -10 || this.x > canvas.width + 10) {
            this.speedX *= -1;
        }

        return twinkle * this.opacity;
    }

    draw(currentOpacity) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();

        // Glow effect for larger stars
        if (this.size > 1.5) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(168, 85, 247, ${currentOpacity * 0.3})`;
            ctx.fill();
        }
    }
}

// Initialize stars
function initStars() {
    stars = [];
    const starCount = Math.min(150, Math.floor((canvas.width * canvas.height) / 10000));
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }
}

initStars();

// Animation loop
function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
        const currentOpacity = star.update();
        star.draw(currentOpacity);
    });

    requestAnimationFrame(animateStars);
}

animateStars();

// Mouse tracking for parallax
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Scroll tracking for parallax
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    updateProgressBar();
}, { passive: true });

// Progress Bar
function updateProgressBar() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('progressBar').style.width = scrolled + "%";
}

// Intersection Observer for scroll reveals
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

// Smooth scroll function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Lightbox functionality
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    lightboxImg.src = src;
    lightbox.classList.remove('hidden');
    
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        lightbox.classList.remove('opacity-0');
        lightboxImg.classList.remove('scale-95');
        lightboxImg.classList.add('scale-100');
    }, 10);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    lightbox.classList.add('opacity-0');
    lightboxImg.classList.remove('scale-100');
    lightboxImg.classList.add('scale-95');
    
    setTimeout(() => {
        lightbox.classList.add('hidden');
    }, 500);
}

document.getElementById('closeLightbox').addEventListener('click', closeLightbox);
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
});

// Floating hearts/particles for message section
function createFloatingParticle() {
    const container = document.getElementById('floatingHearts');
    if (!container) return;
    
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    
    const size = Math.random() * 20 + 10;
    const left = Math.random() * 100;
    const duration = Math.random() * 5 + 8;
    const delay = Math.random() * 5;
    
    particle.style.cssText = `
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(236,72,153,0.2) 100%);
        border-radius: 50%;
        box-shadow: 0 0 ${size}px rgba(168,85,247,0.4);
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
    `;
    
    container.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, (duration + delay) * 1000);
}

// Create particles periodically when message section is visible
let particleInterval;
const messageSection = document.getElementById('message');
const messageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            particleInterval = setInterval(createFloatingParticle, 800);
        } else {
            clearInterval(particleInterval);
        }
    });
}, { threshold: 0.3 });

messageObserver.observe(messageSection);

// Proposal Handling
function handleProposal(answer) {
    const modal = document.getElementById('successModal');
    const content = document.getElementById('successContent');
    const celebrationCanvas = document.getElementById('celebrationCanvas');
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
        content.classList.remove('scale-0');
        content.classList.add('scale-100');
    }, 100);
    
    // Start celebration animation
    initCelebration(celebrationCanvas);
    
    // Optional: Play success sound if audio is enabled
    if (isMusicPlaying) {
        playSuccessSound();
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    const content = document.getElementById('successContent');
    
    content.classList.remove('scale-100');
    content.classList.add('scale-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 500);
    
    // Scroll to final section
    setTimeout(() => {
        scrollToSection('final');
    }, 600);
}

// Celebration Canvas (Confetti/Falling Stars)
function initCelebration(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 150;
    
    class CelebrationParticle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.size = Math.random() * 5 + 2;
            this.speedY = Math.random() * 3 + 2;
            this.speedX = (Math.random() - 0.5) * 2;
            this.color = Math.random() > 0.5 ? '#a855f7' : '#ec4899';
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 10;
            this.opacity = 1;
        }
        
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;
            
            if (this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            
            // Draw heart shape or star
            if (Math.random() > 0.5) {
                // Star
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.size,
                              -Math.sin((18 + i * 72) * Math.PI / 180) * this.size);
                    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.size / 2),
                              -Math.sin((54 + i * 72) * Math.PI / 180) * (this.size / 2));
                }
                ctx.closePath();
                ctx.fill();
            } else {
                // Circle with glow
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
            }
            
            ctx.restore();
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new CelebrationParticle());
    }
    
    // Animation loop
    let animationId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    // Stop after 10 seconds
    setTimeout(() => {
        cancelAnimationFrame(animationId);
    }, 10000);
}

// Audio Handling
let isMusicPlaying = false;
const musicToggle = document.getElementById('musicToggle');
const musicWave = document.getElementById('musicWave');
let audioContext;
let oscillator;
let gainNode;

// Note: In a real scenario, you would load an actual audio file
// This is a placeholder for the romantic background music feature
musicToggle.addEventListener('click', () => {
    isMusicPlaying = !isMusicPlaying;
    
    if (isMusicPlaying) {
        musicWave.style.opacity = '1';
        musicToggle.querySelector('i').classList.add('text-purple-400');
        startAmbientSound();
    } else {
        musicWave.style.opacity = '0';
        musicToggle.querySelector('i').classList.remove('text-purple-400');
        stopAmbientSound();
    }
});

function startAmbientSound() {
    // Create simple ambient drone using Web Audio API
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create oscillator for ambient tone
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 200; // Low ambient tone
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 2);
        
        oscillator.start();
        
        // Add second oscillator for harmony
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 300;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0, audioContext.currentTime);
        gain2.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 2);
        osc2.start();
        
        oscillator.osc2 = osc2;
        oscillator.gain2 = gain2;
        
    } catch (e) {
        console.log('Audio context not supported');
    }
}

function stopAmbientSound() {
    if (audioContext && oscillator) {
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        if (oscillator.gain2) {
            oscillator.gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        }
        
        setTimeout(() => {
            if (oscillator) {
                oscillator.stop();
                if (oscillator.osc2) oscillator.osc2.stop();
            }
        }, 1000);
    }
}

function playSuccessSound() {
    if (!audioContext) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, audioContext.currentTime + 0.1); // C6
    
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.5);
}

// Initialize Lucide icons after DOM load
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
        if (!document.getElementById('successModal').classList.contains('hidden')) {
            closeSuccessModal();
        }
    }
});