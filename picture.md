Integrate the image "holographic-neural-network-right.png" into the hero section as a dynamic, premium background element.

---

GOAL:
Not just display an image, but create a living, immersive visual environment that enhances the hero section.

---

PLACEMENT:

- Position image on the RIGHT side of the hero section
- Use absolute positioning inside hero container
- Image must NOT overlap or reduce readability of text

---

IMPLEMENTATION:

1. HTML:
- Add a container:
  <div class="hero-visual"></div>

- Inside it:
  <img src="holographic-neural-network-right.png" alt="AI network background" />

---

2. CSS (IMPORTANT):

.hero {
  position: relative;
  overflow: hidden;
}

.hero-visual {
  position: absolute;
  right: 0;
  top: 0;
  width: 55%;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.hero-visual img {
  width: 120%;
  max-width: none;
  opacity: 0.35;
  filter: blur(0.5px);
  transform: translateX(10%);
  transition: transform 0.3s ease;
}

---

3. FADE MASK (CRITICAL FOR PREMIUM LOOK):

- Add gradient overlay to softly hide image near text:

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(10, 15, 25, 1) 0%,
    rgba(10, 15, 25, 0.9) 35%,
    rgba(10, 15, 25, 0.6) 60%,
    rgba(10, 15, 25, 0) 100%
  );
  pointer-events: none;
}

---

4. PARALLAX EFFECT (SUBTLE):

- Add slight movement based on cursor:

In script.js:

- Track mouse position
- Move image slightly (max 10–20px)

Effect:
- image slowly shifts opposite to cursor movement

---

5. FLOATING MOTION (IMPORTANT):

- Add slow idle animation:

.hero-visual img {
  animation: float 12s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateX(10%) translateY(0px); }
  50% { transform: translateX(12%) translateY(-10px); }
  100% { transform: translateX(10%) translateY(0px); }
}

---

6. BLEND EFFECT:

- Add soft glow integration:

.hero-visual img {
  mix-blend-mode: screen;
}

---

7. MOBILE VERSION:

- Hide image OR reduce opacity to 0.1
- Ensure performance and readability

---

8. DO NOT:

- Do not make image too sharp
- Do not increase opacity above 0.5
- Do not remove gradient mask
- Do not allow image to dominate text

---

FINAL EFFECT:

- Image feels like part of environment
- Not a picture — a layer of space
- Subtle movement + depth + softness

---

OUTPUT:

Update index.html, styles.css, script.js with full integration.