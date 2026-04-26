Improve the neural network background so it looks premium and natural in BOTH dark and light themes.

---

GOAL:
The image must adapt to theme:
- In dark mode → immersive deep tech background
- In light mode → soft, airy, barely noticeable tech accent

---

1. KEEP IMAGE AS GLOBAL BACKGROUND

body {
  background-repeat: no-repeat;
  background-position: right center;
  background-size: cover;
}

---

2. DARK THEME (CURRENT STYLE — IMPROVE SLIGHTLY)

body[data-theme="dark"] {
  background-color: #0a0f19;
  background-image: url("holographic-neural-network-right.png");
}

body[data-theme="dark"]::before {
  content: "";
  position: fixed;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(10, 15, 25, 0.95) 0%,
    rgba(10, 15, 25, 0.85) 35%,
    rgba(10, 15, 25, 0.6) 60%,
    rgba(10, 15, 25, 0.2) 85%,
    rgba(10, 15, 25, 0) 100%
  );
  pointer-events: none;
}

---

3. LIGHT THEME (CRITICAL FIX)

body[data-theme="light"] {
  background-color: #f5f7fb;
  background-image: url("holographic-neural-network-right.png");
}

body[data-theme="light"]::before {
  content: "";
  position: fixed;
  inset: 0;

  /* MUCH stronger fade */
  background: linear-gradient(
    to right,
    rgba(245, 247, 251, 1) 0%,
    rgba(245, 247, 251, 0.95) 40%,
    rgba(245, 247, 251, 0.85) 60%,
    rgba(245, 247, 251, 0.7) 75%,
    rgba(245, 247, 251, 0.4) 90%,
    rgba(245, 247, 251, 0.2) 100%
  );

  pointer-events: none;
}

---

4. LIGHT THEME IMAGE TUNING (IMPORTANT)

body[data-theme="light"] {
  background-blend-mode: multiply;
  filter: saturate(0.6) brightness(1.1);
}

---

5. ADD SOFT "FOG" EFFECT FOR LIGHT MODE

body[data-theme="light"]::after {
  content: "";
  position: fixed;
  inset: 0;

  background: radial-gradient(
    circle at 75% 50%,
    rgba(255, 255, 255, 0.6),
    rgba(255, 255, 255, 0.2),
    transparent 60%
  );

  pointer-events: none;
}

---

6. TEXT SAFETY (VERY IMPORTANT)

.hero, section, header {
  position: relative;
  z-index: 1;
}

---

7. DO NOT:

- Do NOT use same opacity for both themes
- Do NOT keep dark-style contrast in light theme
- Do NOT let image compete with text

---

8. RESULT:

Dark mode:
→ deep, immersive, tech feel

Light mode:
→ soft, elegant, almost invisible tech texture

---

OUTPUT:

Update styles.css with theme-based background system