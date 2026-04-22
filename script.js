const body = document.body;
const toggleButton = document.getElementById("theme-toggle");
const cursorCanvas = document.getElementById("cursorCanvas");
const THEME_KEY = "landing-theme";

window.addEventListener("pageshow", () => {
  document.body.style.opacity = "1";
});

function applyTheme(theme) {
  const dark = theme === "dark";
  const light = theme === "light";
  body.classList.toggle("dark", dark);
  body.classList.toggle("light", light);
  body.dataset.theme = dark ? "dark" : "light";
  if (toggleButton) {
    toggleButton.textContent = dark ? "☀️" : "🌙";
  }
}

const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === "dark" || savedTheme === "light") {
  applyTheme(savedTheme);
} else {
  applyTheme("light");
}

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    const nextTheme = body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });
}

if (cursorCanvas) {
  const ctx = cursorCanvas.getContext("2d", { alpha: true });

  if (ctx) {
    const particles = [];
    const maxParticles = 56;
    const trailPoints = [];
    const maxTrailPoints = 8;
    const mouse = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      prevX: window.innerWidth * 0.5,
      prevY: window.innerHeight * 0.5,
      moved: false
    };

    const follower = {
      x: mouse.x,
      y: mouse.y
    };

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cursorCanvas.width = Math.floor(window.innerWidth * dpr);
      cursorCanvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnParticle(x, y, baseAngle, speedScale) {
      const spread = (Math.random() * 50 - 25) * (Math.PI / 180);
      const angle = baseAngle + spread;
      const speed = (0.18 + Math.random() * 0.24) * speedScale;
      const life = 30 + Math.random() * 42;
      const friction = 0.94 + Math.random() * 0.03;
      particles.push({
        x: x + Math.cos(angle) * (Math.random() * 0.9),
        y: y + Math.sin(angle) * (Math.random() * 0.9),
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.08,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.08,
        life,
        friction,
        age: 0,
        size: 0.8 + Math.random() * 1.2,
        blurBase: 4 + Math.random() * 3,
        seed: Math.random() * Math.PI * 2
      });

      if (particles.length > maxParticles) {
        particles.shift();
      }
    }

    function animate() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "lighter";

      follower.x += (mouse.x - follower.x) * 0.16;
      follower.y += (mouse.y - follower.y) * 0.16;

      if (mouse.moved) {
        const dx = mouse.x - mouse.prevX;
        const dy = mouse.y - mouse.prevY;
        const distance = Math.hypot(dx, dy);

        trailPoints.push({ x: follower.x, y: follower.y });
        if (trailPoints.length > maxTrailPoints) {
          trailPoints.shift();
        }

        const baseAngle = Math.atan2(dy || 0.001, dx || 0.001);
        const spawnCount = Math.min(2, Math.max(1, Math.floor(distance / 22)));
        for (let t = 0; t < trailPoints.length; t += 1) {
          const point = trailPoints[t];
          const trailWeight = (t + 1) / trailPoints.length;
          for (let i = 0; i < spawnCount; i += 1) {
            spawnParticle(point.x, point.y, baseAngle, 0.75 + trailWeight * 0.35);
          }
        }

        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.age += 1;
        if (p.age >= p.life) {
          particles.splice(i, 1);
          continue;
        }

        const noise = Math.sin((p.age * 0.11) + p.seed) * 0.012;
        p.vx = (p.vx + noise) * p.friction;
        p.vy = (p.vy + noise * 0.7) * p.friction;
        p.x += p.vx;
        p.y += p.vy;

        const t = p.age / p.life;
        const alpha = Math.max(0, 0.15 * (1 - t) * (1 - t * 0.2));
        const radius = p.size * (1 + t * 0.6);
        const blur = p.blurBase + t * 5;

        ctx.beginPath();
        ctx.fillStyle = `rgba(120, 200, 255, ${alpha.toFixed(3)})`;
        ctx.shadowColor = `rgba(120, 200, 255, ${(alpha * 0.95).toFixed(3)})`;
        ctx.shadowBlur = blur;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.moved = true;
    });

    window.addEventListener("mouseleave", () => {
      mouse.moved = false;
      trailPoints.length = 0;
    });

    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();
    animate();
  }
}

const revealElements = document.querySelectorAll(".reveal");
if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  revealElements.forEach((element) => revealObserver.observe(element));
}

const aboutPhotoWrap = document.querySelector(".about-photo-wrap");
const aboutPhotoGlow = document.querySelector(".about-photo-glow");
if (aboutPhotoWrap && aboutPhotoGlow) {
  aboutPhotoWrap.addEventListener("mousemove", (event) => {
    const rect = aboutPhotoWrap.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    aboutPhotoGlow.style.left = `${x}px`;
    aboutPhotoGlow.style.top = `${y}px`;
    aboutPhotoGlow.style.opacity = "0.6";
  });

  aboutPhotoWrap.addEventListener("mouseleave", () => {
    aboutPhotoGlow.style.opacity = "0";
  });
}

const stickyTelegram = document.getElementById("sticky-telegram");
if (stickyTelegram) {
  const toggleStickyButton = () => {
    if (window.scrollY > 100) {
      stickyTelegram.classList.add("is-visible");
      return;
    }
    stickyTelegram.classList.remove("is-visible");
  };

  window.addEventListener("scroll", toggleStickyButton, { passive: true });
  toggleStickyButton();
}

const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const toggleHeaderScrolled = () => {
    siteHeader.classList.toggle("scrolled", window.scrollY > 20);
  };

  window.addEventListener("scroll", toggleHeaderScrolled, { passive: true });
  toggleHeaderScrolled();
}

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", function (event) {
    const href = this.getAttribute("href");

    if (href && href.endsWith(".html")) {
      event.preventDefault();
      document.body.style.transition = "opacity 0.2s ease";
      document.body.style.opacity = "0";

      setTimeout(() => {
        window.location.href = href;
      }, 200);
    }
  });
});

const cards = Array.from(document.querySelectorAll("#benefits .benefit-grid .card"));
if (cards.length > 0) {
  cards.forEach((card) => card.classList.add("cards-item"));
  let index = 0;

  const activateNextCard = () => {
    cards.forEach((card) => card.classList.remove("active"));
    cards[index].classList.add("active");
    index = (index + 1) % cards.length;
  };

  activateNextCard();
  setInterval(activateNextCard, 1000);
}

