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
  const finalCtaSection = document.getElementById("cta");
  const toggleStickyButton = () => {
    const nearFinalCta = finalCtaSection
      ? finalCtaSection.getBoundingClientRect().top <= (window.innerHeight * 0.92)
      : false;

    if (window.scrollY > 100 && !nearFinalCta) {
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

const LANG_KEY = "landing-language";
const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
const metaDescription = document.querySelector('meta[name="description"]');

const translations = {
  ru: {
    title: "AI-инструменты для бизнеса | Автоматизация за 3-7 дней",
    description: "Создаю AI-инструменты под задачи бизнеса за 3-7 дней: GPT-агенты, AI-консультанты, Telegram-боты и автоматизации. Снижайте ручную нагрузку и ускоряйте процессы уже в первую неделю.",
    brand: "AI для бизнеса",
    navHow: "Как это работает",
    navFaq: "FAQ",
    navOffer: "Договор оферты",
    heroTitle: "AI-инструменты, которые убирают рутину и приводят клиентов",
    heroAccentPhrase: "AI-инструменты",
    heroLead: "Собираю GPT-агентов, Telegram-ботов, сайты и приложения под задачи бизнеса: заявки, продажи, запись, клиентский сервис и автоматизацию процессов.",
    heroSupport: "Без сложной разработки, лишней теории и хаоса. От идеи до рабочего решения — за несколько дней.",
    heroButton: "Обсудить AI-решение",
    heroSecondaryButton: "Посмотреть форматы работы",
    painEyebrow: "Почему AI не работает у большинства",
    painTitle: "Проблема не в AI. Проблема в том, как его внедряют.",
    painSubtitle: "AI не даёт результат, когда его запускают без задачи, логики и связи с реальной работой команды.",
    painBridge: "Вот где ломается большинство решений:",
    painDiagTitles: [
      "Нет понятной задачи",
      "Нет сценария работы",
      "Не встроен в процессы",
      "Не доводят до результата"
    ],
    painDiagTexts: [
      "AI запускают “потому что надо”, а не под конкретный результат. В итоге он ничего полезного не меняет.",
      "Красиво показать AI мало. Нужно понимать, что он делает на каждом этапе.",
      "Если AI живёт отдельно от команды, клиентов и CRM, он остаётся игрушкой, а не инструментом.",
      "AI нельзя просто включить. Его нужно тестировать, править и докручивать под реальную работу."
    ],
    painConclusion: "Поэтому я не “подключаю AI”. Я собираю рабочую систему под ваш бизнес.",
    howTitle: "Как это работает",
    howSubtitle: "Без сложных схем. Работа строится в 3 понятных шага.",
    howStepTitles: [
      "Вы ставите задачу",
      "Я собираю решение",
      "Запускаем и докручиваем"
    ],
    howStepTexts: [
      "Обсуждаем, что нужно автоматизировать, упростить или запустить и какой результат нужен бизнесу.",
      "Проектирую AI-инструмент под ваш процесс: логику, сценарии, структуру и рабочий путь клиента.",
      "Тестируем, запускаем, смотрим в работе и донастраиваем под реальные задачи команды и клиентов."
    ],
    howResult: "На выходе вы получаете не “ещё один AI”, а рабочий инструмент, который экономит время, снижает рутину и помогает бизнесу расти.",
    benefitsTitle: "Форматы работы",
    benefitsSubtitle: "Я собираю AI-решения под конкретные задачи бизнеса: от автоматизации и GPT-агентов до сайтов, ботов и приложений под ваш процесс.",
    formatsCards: [
      {
        title: "Индивидуальная работа",
        text: "Для тех, кому нужен AI не “разобраться”, а встроить в работу и монетизацию.",
        bullets: ["персональная стратегия", "AI под вашу задачу", "внедрение в процессы", "сопровождение и корректировка"],
        price: "от 30 000 ₽ / месяц",
        note: "Подходит экспертам и предпринимателям, которым нужен результат, а не теория."
      },
      {
        title: "GPT-агенты для бизнеса",
        text: "Собираю AI-инструменты под конкретные бизнес-задачи: продажи, заявки, контент, клиентский путь, автоматизация команды.",
        bullets: ["GPT-ассистенты", "AI-операторы", "AI-воронки", "внутренние AI-инструменты"],
        price: "от 15 000 ₽",
        note: "Для бизнеса, где AI должен экономить время и приносить деньги."
      },
      {
        title: "Сайты и AI-упаковка",
        text: "Собираю сайты, где AI работает на конверсию: структура, логика, контент и сценарии.",
        bullets: ["сайты", "лендинги", "AI-структура", "тексты и воронка"],
        price: "от 45 000 ₽",
        note: "Для бизнеса, которому нужен сайт, который не висит, а продаёт."
      },
      {
        title: "Приложения под ваш бизнес",
        text: "Собираю приложения под конкретный бизнес-процесс: обучение, сервис, внутренние задачи, клиентский путь.",
        bullets: ["мобильные приложения", "клиентские кабинеты", "внутренние сервисы", "AI-функции внутри продукта"],
        price: "от 60 000 ₽",
        note: "Для бизнеса, которому нужен свой цифровой продукт, а не очередной конструктор."
      },
      {
        title: "AI-боты и автоматизация",
        text: "Боты для Telegram и сайтов: заявки, ответы, записи, навигация, продажи и сценарии.",
        bullets: ["Telegram-боты", "чат-боты для сайта", "логика диалога", "интеграции"],
        price: "от 15 000 ₽ + платформа",
        note: "Для бизнеса, где заявки, ответы и коммуникация не должны зависеть от ручного ресурса."
      }
    ],
    formatsCta: "Обсудить проект",
    aboutTitle: "Как я выстраиваю <span class=\"about-title-accent\">AI-инструменты</span> под ваш бизнес",
    aboutLead1: "Я не просто настраиваю AI - я выстраиваю рабочую систему под ваши задачи. Погружаюсь в процессы, понимаю, где теряются время и деньги, и создаю AI-инструмент, который действительно решает эти проблемы.",
    aboutLead2: "Для меня важно, чтобы решение было не только технологичным, но и удобным, понятным и приносило реальную пользу бизнесу.",
    stageTitles: ["Анализ и погружение", "Проектирование решения", "Разработка и настройка", "Запуск и поддержка"],
    stageTexts: [
      "Изучаю бизнес-процессы, боли и цели, чтобы понять, где AI даст максимальный эффект.",
      "Проектирую логику, сценарии, интеграции и базы знаний под вашу модель работы.",
      "Создаю и настраиваю AI-решение, обучаю на данных и подключаю нужные сервисы.",
      "Тестирую, запускаю и сопровождаю, чтобы решение развивалось вместе с бизнесом."
    ],
    faqTitle: "Частые вопросы",
    faqSubtitle: "Коротко о том, как проходит работа, какие решения можно собрать и что нужно для старта.",
    faqQuestions: [
      "Какие AI-решения вы создаёте?",
      "Чем GPT-агент отличается от обычного чат-бота?",
      "Можно ли сделать бота для Telegram или сайта?",
      "Сколько времени занимает разработка?",
      "Что нужно от меня для начала работы?",
      "Можно ли начать с небольшого проекта?"
    ],
    faqAnswers: [
      "Я создаю AI-инструменты под задачи бизнеса: GPT-агентов, AI-консультантов, Telegram-ботов, OpenClaw-агентов, multi-agent системы, сайты, приложения и интерактивные digital-механики. Формат решения подбирается под вашу задачу: автоматизация, заявки, клиентский сервис, продажи, обучение или вовлечение аудитории.",
      "Обычный бот чаще работает по заранее заданному сценарию. GPT-агент может анализировать запрос, вести более живую переписку, работать с базой знаний, помогать клиенту, подбирать решение и брать на себя часть рутинных задач. Это не просто “ответчик”, а рабочий AI-инструмент под конкретный процесс.",
      "Да. Я создаю ботов и AI-консультантов для Telegram-каналов, личных сообщений и сайтов. Они могут отвечать на вопросы, записывать клиентов, собирать заявки, вести переписку, помогать с выбором услуги и передавать клиента к вам или менеджеру.",
      "Простые решения можно собрать за несколько дней. Более сложные проекты — GPT-агенты, OpenClaw-агенты, multi-agent системы, сайты или приложения — требуют больше времени, потому что важно не просто “запустить”, а продумать логику, сценарии, тексты, структуру и стабильную работу.",
      "На старте нужна задача: что вы хотите автоматизировать, улучшить или запустить. Дальше я помогаю сформулировать логику решения, определить сценарии, собрать структуру, подготовить тексты и понять, какой AI-инструмент подойдёт лучше всего.",
      "Да. Можно начать с одного понятного решения: Telegram-бота, AI-консультанта, мини-лендинга, GPT-агента для одной задачи или интерактивной механики. Это хороший способ быстро протестировать AI в бизнесе без лишней сложности и раздутого бюджета."
    ],
    conversionTitle: "Что вы получите уже на старте",
    conversionCardTitles: ["Первый разбор под ваш бизнес", "Как мы можем выстроить работу"],
    conversionItems: [
      [
        "✔ Чеклист: какие задачи выгодно отдать AI-инструментам",
        "✔ Подбор решений под ваш бизнес",
        "✔ Разбор, где вы теряете деньги без автоматизации"
      ],
      [
        "✔ Быстрый запуск под ключ",
        "✔ Внедрение под ваши процессы",
        "✔ Поддержка и доработка системы"
      ]
    ],
    ctaTitle: "Напишите в Telegram и получите разбор проекта под ваш бизнес",
    ctaButton: "Обсудить проект",
    secondaryContact: "Или напишите на почту:",
    footerTelegram: "Telegram: @neuro_for_me",
    footerEmail: "Email: olga.chichkun@mail.ru",
    footerOffer: "Договор оферты",
    themeLabel: "Переключить тему",
    langLabel: "Выбор языка"
  },
  en: {
    title: "AI tools for business | Automation in 3-7 days",
    description: "I build AI tools tailored to business goals in 3-7 days: GPT agents, AI consultants, Telegram bots, and automations. Reduce manual workload and speed up processes in week one.",
    brand: "AI for business",
    navHow: "How it works",
    navFaq: "FAQ",
    navOffer: "Public offer",
    heroTitle: "AI tools that remove routine and bring clients",
    heroAccentPhrase: "AI tools",
    heroLead: "I build GPT agents, Telegram bots, websites, and apps for business tasks: leads, sales, bookings, customer service, and process automation.",
    heroSupport: "No complex development, extra theory, or chaos. From idea to a working solution in just a few days.",
    heroButton: "Discuss AI solution",
    heroSecondaryButton: "View work formats",
    painEyebrow: "Why AI fails for most teams",
    painTitle: "The problem is not AI. The problem is how it gets implemented.",
    painSubtitle: "AI does not deliver results when it is launched without a clear task, logic, and connection to real team workflows.",
    painBridge: "Here is where most solutions break:",
    painDiagTitles: [
      "No clear task",
      "No working scenario",
      "Not integrated into processes",
      "Not refined to results"
    ],
    painDiagTexts: [
      "AI is launched because it feels necessary, not for a concrete result. In the end, it changes nothing useful.",
      "A nice AI demo is not enough. You need to define what it does at each stage.",
      "If AI lives separately from the team, clients, and CRM, it stays a toy, not a tool.",
      "AI cannot just be switched on. It needs testing, fixes, and tuning for real work."
    ],
    painConclusion: "That is why I do not just “connect AI”. I build a working system for your business.",
    howTitle: "How it works",
    howSubtitle: "No complex schemes. The work is built in 3 clear steps.",
    howStepTitles: [
      "You define the goal",
      "I build the solution",
      "We launch and refine"
    ],
    howStepTexts: [
      "We clarify what should be automated, simplified, or launched and what business result you need.",
      "I design the AI tool for your workflow: logic, scenarios, structure, and customer path.",
      "We test, launch, observe real usage, and fine-tune for actual team and client tasks."
    ],
    howResult: "In the end, you get not just another AI demo, but a working tool that saves time, reduces routine, and helps your business grow.",
    benefitsTitle: "Work formats",
    benefitsSubtitle: "I build AI solutions for concrete business tasks: from automation and GPT agents to websites, bots, and applications tailored to your process.",
    formatsCards: [
      {
        title: "Individual work",
        text: "For those who need AI not just to understand it, but to embed it into operations and monetization.",
        bullets: ["personal strategy", "AI tailored to your task", "implementation into workflows", "support and ongoing adjustments"],
        price: "from ₽30,000 / month",
        note: "Best for experts and founders who need outcomes, not theory."
      },
      {
        title: "GPT agents for business",
        text: "I build AI tools for concrete business goals: sales, leads, content, customer journey, and team automation.",
        bullets: ["GPT assistants", "AI operators", "AI funnels", "internal AI tools"],
        price: "from ₽15,000",
        note: "For businesses where AI must save time and bring revenue."
      },
      {
        title: "Websites and AI packaging",
        text: "I build websites where AI drives conversion: structure, logic, content, and scenarios.",
        bullets: ["websites", "landing pages", "AI structure", "copy and funnel"],
        price: "from ₽45,000",
        note: "For businesses that need a website that sells, not just exists."
      },
      {
        title: "Applications for your business",
        text: "I build applications for specific business processes: education, service, internal operations, and customer journey.",
        bullets: ["mobile applications", "client cabinets", "internal services", "AI features inside the product"],
        price: "from ₽60,000",
        note: "For businesses that need their own digital product, not another template builder."
      },
      {
        title: "AI bots and automation",
        text: "Bots for Telegram and websites: leads, replies, bookings, navigation, sales, and scenarios.",
        bullets: ["Telegram bots", "website chatbots", "dialog logic", "integrations"],
        price: "from ₽15,000 + platform",
        note: "For businesses where leads and communication cannot depend on manual effort."
      }
    ],
    formatsCta: "Discuss task",
    aboutTitle: "How I build <span class=\"about-title-accent\">AI tools</span> for your business",
    aboutLead1: "I do not just configure AI - I build a working system around your goals. I dive into your processes, identify where time and money are lost, and create an AI tool that solves those issues.",
    aboutLead2: "For me, it is essential that the solution is not only advanced, but also practical, clear, and truly useful for your business.",
    stageTitles: ["Analysis & discovery", "Solution design", "Development & setup", "Launch & support"],
    stageTexts: [
      "I study your workflows, pain points, and goals to find where AI gives the biggest impact.",
      "I design the logic, scenarios, integrations, and knowledge base for your operating model.",
      "I build and configure the AI solution, train it on data, and connect required services.",
      "I test, launch, and support the solution so it evolves together with your business."
    ],
    faqTitle: "Frequently asked questions",
    faqSubtitle: "A quick overview of how the work goes, which solutions we can build, and what is needed to start.",
    faqQuestions: [
      "What AI solutions do you build?",
      "How is a GPT agent different from a regular chatbot?",
      "Can you build a bot for Telegram or a website?",
      "How long does development take?",
      "What do you need from me to start?",
      "Can we start with a small project?"
    ],
    faqAnswers: [
      "I build AI tools tailored to business goals: GPT agents, AI consultants, Telegram bots, OpenClaw agents, multi-agent systems, websites, apps, and interactive digital mechanics. The format is selected based on your objective: automation, lead capture, client service, sales, training, or audience engagement.",
      "A regular bot usually follows fixed scripts. A GPT agent can analyze user intent, hold more natural conversations, work with a knowledge base, assist clients, suggest solutions, and handle routine tasks. It is not just a responder - it is a working AI tool built for a specific process.",
      "Yes. I build bots and AI consultants for Telegram channels, direct messages, and websites. They can answer questions, book clients, collect leads, maintain conversations, help users choose services, and hand off to you or your manager.",
      "Simple solutions can be delivered in a few days. More advanced projects - GPT agents, OpenClaw agents, multi-agent systems, websites, or apps - take longer because the logic, scenarios, content, structure, and reliability must be designed properly.",
      "At the start, I need your goal: what you want to automate, improve, or launch. Then I help shape the solution logic, define scenarios, build the structure, prepare copy, and choose the AI format that fits best.",
      "Yes. You can start with one focused solution: a Telegram bot, AI consultant, mini landing page, a single-task GPT agent, or an interactive mechanic. It is a fast and safe way to test AI in business without unnecessary complexity or an inflated budget."
    ],
    conversionTitle: "Extra assets to boost conversion",
    conversionCardTitles: ["What you can get right now", "How we can work together"],
    conversionItems: [
      [
        "✔ Checklist: which tasks are best delegated to AI tools",
        "✔ Tailored solution selection for your business",
        "✔ Audit of where you lose money without automation"
      ],
      [
        "✔ Fast turnkey launch",
        "✔ Implementation into your workflows",
        "✔ Ongoing support and iterative improvements"
      ]
    ],
    ctaTitle: "Message me on Telegram and get a project breakdown for your business",
    ctaButton: "Discuss project",
    secondaryContact: "Or email me at:",
    footerTelegram: "Telegram: @neuro_for_me",
    footerEmail: "Email: olga.chichkun@mail.ru",
    footerOffer: "Public offer",
    themeLabel: "Toggle theme",
    langLabel: "Language switcher"
  },
  es: {
    title: "Herramientas de IA para negocios | Automatizacion en 3-7 dias",
    description: "Creo herramientas de IA para objetivos de negocio en 3-7 dias: agentes GPT, consultores IA, bots de Telegram y automatizaciones. Reduce la carga manual y acelera procesos desde la primera semana.",
    brand: "IA para negocios",
    navHow: "Como funciona",
    navFaq: "FAQ",
    navOffer: "Oferta publica",
    heroTitle: "Herramientas de IA que eliminan rutina y atraen clientes",
    heroAccentPhrase: "Herramientas de IA",
    heroLead: "Construyo agentes GPT, bots de Telegram, sitios y apps para tareas del negocio: leads, ventas, reservas, servicio al cliente y automatizacion de procesos.",
    heroSupport: "Sin desarrollo complejo, teoria innecesaria ni caos. De la idea a una solucion funcional en pocos dias.",
    heroButton: "Hablar de solucion IA",
    heroSecondaryButton: "Ver formatos de trabajo",
    painEyebrow: "Por que la IA no funciona para la mayoria",
    painTitle: "El problema no es la IA. El problema es como se implementa.",
    painSubtitle: "La IA no da resultado cuando se lanza sin una tarea clara, logica y conexion con el trabajo real del equipo.",
    painBridge: "Aqui es donde se rompen la mayoria de soluciones:",
    painDiagTitles: [
      "No hay una tarea clara",
      "No hay escenario de trabajo",
      "No esta integrada en procesos",
      "No se lleva al resultado"
    ],
    painDiagTexts: [
      "La IA se lanza porque hay que hacerlo, no por un resultado concreto. Al final no cambia nada util.",
      "Mostrar una demo bonita no alcanza. Hay que definir que hace en cada etapa.",
      "Si la IA vive separada del equipo, clientes y CRM, se queda como juguete y no como herramienta.",
      "La IA no se puede solo encender. Hay que probarla, corregirla y ajustarla al trabajo real."
    ],
    painConclusion: "Por eso no solo “conecto IA”. Construyo un sistema de trabajo para tu negocio.",
    howTitle: "Como funciona",
    howSubtitle: "Sin esquemas complejos. El trabajo se construye en 3 pasos claros.",
    howStepTitles: [
      "Definimos la tarea",
      "Construyo la solucion",
      "Lanzamos y ajustamos"
    ],
    howStepTexts: [
      "Acordamos que necesitas automatizar, simplificar o lanzar y que resultado quieres para el negocio.",
      "Diseno la herramienta de IA para tu proceso: logica, escenarios, estructura y ruta del cliente.",
      "Probamos, lanzamos, vemos el trabajo real y ajustamos para tareas reales del equipo y clientes."
    ],
    howResult: "Al final obtienes no otro AI mas, sino una herramienta de trabajo que ahorra tiempo, reduce rutina y ayuda al crecimiento del negocio.",
    benefitsTitle: "Formatos de trabajo",
    benefitsSubtitle: "Construyo soluciones de IA para tareas concretas del negocio: desde automatizacion y agentes GPT hasta sitios, bots y aplicaciones para tu proceso.",
    formatsCards: [
      {
        title: "Trabajo individual",
        text: "Para quien necesita IA no solo para entenderla, sino para integrarla en trabajo y monetizacion.",
        bullets: ["estrategia personalizada", "IA para tu tarea", "implementacion en procesos", "acompanamiento y ajustes"],
        price: "desde 30 000 ₽ / mes",
        note: "Ideal para expertos y emprendedores que buscan resultado, no teoria."
      },
      {
        title: "Agentes GPT para negocio",
        text: "Construyo herramientas IA para objetivos concretos: ventas, leads, contenido, recorrido del cliente y automatizacion del equipo.",
        bullets: ["asistentes GPT", "operadores IA", "embudos IA", "herramientas IA internas"],
        price: "desde 15 000 ₽",
        note: "Para negocios donde IA debe ahorrar tiempo y generar ingresos."
      },
      {
        title: "Sitios web y empaque IA",
        text: "Creo sitios donde IA trabaja para conversion: estructura, logica, contenido y escenarios.",
        bullets: ["sitios web", "landing pages", "estructura IA", "textos y embudo"],
        price: "desde 45 000 ₽",
        note: "Para negocios que necesitan un sitio que venda y no solo exista."
      },
      {
        title: "Aplicaciones para tu negocio",
        text: "Construyo aplicaciones para procesos concretos: formacion, servicio, tareas internas y recorrido del cliente.",
        bullets: ["aplicaciones moviles", "cabinetes de cliente", "servicios internos", "funciones IA dentro del producto"],
        price: "desde 60 000 ₽",
        note: "Para negocios que necesitan su propio producto digital, no otro constructor generico."
      },
      {
        title: "Bots IA y automatizacion",
        text: "Bots para Telegram y sitios: leads, respuestas, reservas, navegacion, ventas y escenarios.",
        bullets: ["bots de Telegram", "chatbots para sitio", "logica de dialogo", "integraciones"],
        price: "desde 15 000 ₽ + plataforma",
        note: "Para negocios donde leads y comunicacion no deben depender del recurso manual."
      }
    ],
    formatsCta: "Hablar de la tarea",
    aboutTitle: "Como construyo <span class=\"about-title-accent\">herramientas de IA</span> para tu negocio",
    aboutLead1: "No solo configuro IA: construyo un sistema de trabajo segun tus objetivos. Analizo procesos, detecto donde se pierden tiempo y dinero, y creo una herramienta que realmente resuelve estos puntos.",
    aboutLead2: "Para mi es clave que la solucion sea no solo tecnologica, sino tambien comoda, clara y util para el negocio.",
    stageTitles: ["Analisis y descubrimiento", "Diseno de la solucion", "Desarrollo y configuracion", "Lanzamiento y soporte"],
    stageTexts: [
      "Estudio tus procesos, dolores y objetivos para detectar donde IA aporta mayor impacto.",
      "Diseno logica, escenarios, integraciones y base de conocimiento para tu modelo de trabajo.",
      "Creo y configuro la solucion IA, la entreno con datos y conecto los servicios necesarios.",
      "Pruebo, lanzo y acompano la solucion para que evolucione junto a tu negocio."
    ],
    faqTitle: "Preguntas frecuentes",
    faqSubtitle: "En breve: como trabajamos, que soluciones se pueden crear y que hace falta para empezar.",
    faqQuestions: [
      "Que soluciones de IA creas?",
      "En que se diferencia un agente GPT de un chatbot comun?",
      "Se puede hacer un bot para Telegram o para un sitio web?",
      "Cuanto tiempo tarda el desarrollo?",
      "Que necesitas de mi para empezar?",
      "Se puede comenzar con un proyecto pequeno?"
    ],
    faqAnswers: [
      "Creo herramientas de IA para objetivos de negocio: agentes GPT, consultores IA, bots de Telegram, agentes OpenClaw, sistemas multi-agent, sitios web, aplicaciones y mecanicas digitales interactivas. El formato se elige segun tu objetivo: automatizacion, captacion de leads, servicio al cliente, ventas, formacion o engagement.",
      "Un bot comun suele seguir guiones fijos. Un agente GPT puede analizar la solicitud, mantener una conversacion mas natural, trabajar con base de conocimiento, ayudar al cliente, sugerir soluciones y asumir tareas repetitivas. No es solo un contestador, es una herramienta IA para un proceso real.",
      "Si. Creo bots y consultores IA para canales de Telegram, mensajes privados y sitios web. Pueden responder preguntas, registrar clientes, captar solicitudes, mantener conversaciones, ayudar con la eleccion de servicio y transferir al cliente a ti o a tu equipo.",
      "Las soluciones simples se pueden lanzar en pocos dias. Los proyectos mas complejos - agentes GPT, OpenClaw, sistemas multi-agent, sitios o apps - requieren mas tiempo porque hay que disenar logica, escenarios, textos, estructura y estabilidad.",
      "Al inicio necesito tu objetivo: que quieres automatizar, mejorar o lanzar. Luego te ayudo a definir la logica, escenarios, estructura, textos y el formato de IA que mejor encaja.",
      "Si. Puedes empezar con una solucion puntual: bot de Telegram, consultor IA, mini landing, agente GPT para una tarea o mecanica interactiva. Es una forma rapida de probar IA en negocio sin complejidad ni presupuesto inflado."
    ],
    conversionTitle: "Extra para aumentar conversion",
    conversionCardTitles: ["Lo que puedes obtener ahora", "Como podemos colaborar"],
    conversionItems: [
      [
        "✔ Checklist: que tareas conviene delegar a herramientas IA",
        "✔ Seleccion de soluciones para tu negocio",
        "✔ Analisis de donde pierdes dinero sin automatizacion"
      ],
      [
        "✔ Lanzamiento rapido llave en mano",
        "✔ Implementacion en tus procesos",
        "✔ Soporte y mejora continua del sistema"
      ]
    ],
    ctaTitle: "Escribeme por Telegram y recibe un analisis del proyecto para tu negocio",
    ctaButton: "Hablar del proyecto",
    secondaryContact: "O escribeme al correo:",
    footerTelegram: "Telegram: @neuro_for_me",
    footerEmail: "Email: olga.chichkun@mail.ru",
    footerOffer: "Oferta publica",
    themeLabel: "Cambiar tema",
    langLabel: "Selector de idioma"
  }
};

function setText(selector, text) {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = text;
  }
}

function applyLanguage(lang) {
  const data = translations[lang] || translations.ru;

  document.documentElement.lang = lang === "ru" ? "ru" : lang === "es" ? "es" : "en";
  document.title = data.title;
  if (metaDescription) {
    metaDescription.setAttribute("content", data.description);
  }

  setText(".brand", data.brand);
  const brandLink = document.querySelector(".brand");
  if (brandLink) {
    brandLink.setAttribute("aria-label", data.brand);
  }
  const navLinks = document.querySelectorAll(".nav > a");
  if (navLinks[0]) navLinks[0].textContent = data.navHow;
  if (navLinks[1]) navLinks[1].textContent = data.navFaq;
  if (navLinks[2]) navLinks[2].textContent = data.navOffer;

  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    const accentPhrase = data.heroAccentPhrase || "";
    if (accentPhrase && data.heroTitle.includes(accentPhrase)) {
      heroTitle.innerHTML = data.heroTitle.replace(accentPhrase, `<span class="hero-title-accent">${accentPhrase}</span>`);
    } else {
      heroTitle.textContent = data.heroTitle;
    }
  }
  const heroLead = document.querySelector(".hero-lead");
  if (heroLead) {
    heroLead.textContent = data.heroLead;
  }
  setText(".hero-support", data.heroSupport || "");
  setText("#hero .btn-primary", data.heroButton);
  setText("#hero .hero-secondary-btn", data.heroSecondaryButton || "");

  setText("#pain .pain-eyebrow", data.painEyebrow || "");
  setText("#pain h2", data.painTitle);
  setText("#pain .pain-subtitle", data.painSubtitle || "");
  setText("#pain .pain-bridge", data.painBridge || "");
  document.querySelectorAll("#pain .pain-card").forEach((card, index) => {
    const title = card.querySelector("h3");
    const text = card.querySelector("p");
    if (title) title.textContent = (data.painDiagTitles || [])[index] || "";
    if (text) text.textContent = (data.painDiagTexts || [])[index] || "";
  });
  setText("#pain .pain-conclusion", data.painConclusion || "");

  setText("#how h2", data.howTitle);
  setText("#how .how-subtitle", data.howSubtitle || "");
  document.querySelectorAll("#how .how-card").forEach((card, index) => {
    const stepTitle = card.querySelector("h3");
    const stepText = card.querySelector("p:last-child");
    if (stepTitle) stepTitle.textContent = (data.howStepTitles || [])[index] || "";
    if (stepText) stepText.textContent = (data.howStepTexts || [])[index] || "";
  });
  setText("#how .how-result", data.howResult || "");

  setText("#benefits h2", data.benefitsTitle);
  setText("#benefits .benefits-subtitle", data.benefitsSubtitle || "");
  document.querySelectorAll("#benefits .format-card").forEach((card, index) => {
    const cardData = (data.formatsCards || [])[index] || {};
    const title = card.querySelector("h3");
    const text = card.querySelector(".format-text");
    const price = card.querySelector(".format-price");
    const note = card.querySelector(".format-note");
    if (title) title.textContent = cardData.title || "";
    if (text) text.textContent = cardData.text || "";
    if (price) price.textContent = cardData.price || "";
    if (note) note.textContent = cardData.note || "";
    card.querySelectorAll(".format-list li").forEach((li, liIndex) => {
      li.textContent = (cardData.bullets || [])[liIndex] || "";
    });
  });
  setText("#benefits .formats-cta", data.formatsCta || "");

  const aboutTitle = document.querySelector("#about .about-head h1");
  if (aboutTitle) {
    aboutTitle.innerHTML = data.aboutTitle;
  }
  const aboutLeads = document.querySelectorAll("#about .about-lead");
  if (aboutLeads[0]) aboutLeads[0].textContent = data.aboutLead1;
  if (aboutLeads[1]) aboutLeads[1].textContent = data.aboutLead2;

  document.querySelectorAll("#about .about-stage-card").forEach((card, index) => {
    const stageTitle = card.querySelector("h3");
    const stageText = card.querySelector("p:last-child");
    if (stageTitle) stageTitle.textContent = data.stageTitles[index] || "";
    if (stageText) stageText.textContent = data.stageTexts[index] || "";
  });

  setText("#faq h2", data.faqTitle);
  setText("#faq .faq-subtitle", data.faqSubtitle || "");
  document.querySelectorAll("#faq .faq-list details").forEach((detail, index) => {
    const summary = detail.querySelector("summary");
    const answer = detail.querySelector("p");
    if (summary) summary.textContent = data.faqQuestions[index] || "";
    if (answer) answer.textContent = data.faqAnswers[index] || "";
  });

  setText(".conversion h2", data.conversionTitle);
  const conversionCards = document.querySelectorAll(".conversion-card");
  conversionCards.forEach((card, cardIndex) => {
    const cardTitle = card.querySelector("h3");
    if (cardTitle) cardTitle.textContent = data.conversionCardTitles[cardIndex] || "";
    card.querySelectorAll("li").forEach((li, liIndex) => {
      li.textContent = (data.conversionItems[cardIndex] || [])[liIndex] || "";
    });
  });

  setText("#cta h2", data.ctaTitle);
  setText("#cta .btn-primary", data.ctaButton);

  const secondaryContact = document.querySelector(".secondary-contact");
  if (secondaryContact) {
    secondaryContact.innerHTML = `${data.secondaryContact} <a href="mailto:olga.chichkun@mail.ru">olga.chichkun@mail.ru</a>`;
  }

  const footerLinks = document.querySelectorAll(".footer-content a");
  if (footerLinks[0]) footerLinks[0].textContent = data.footerTelegram;
  if (footerLinks[1]) footerLinks[1].textContent = data.footerEmail;
  if (footerLinks[2]) footerLinks[2].textContent = data.footerOffer;

  setText("#sticky-telegram", data.formatsCta || data.ctaButton);

  if (toggleButton) {
    toggleButton.setAttribute("aria-label", data.themeLabel);
  }
  const langGroup = document.querySelector(".lang-switch");
  if (langGroup) {
    langGroup.setAttribute("aria-label", data.langLabel);
  }

  langButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });
}

const savedLang = localStorage.getItem(LANG_KEY);
const initialLang = savedLang && translations[savedLang] ? savedLang : "ru";
applyLanguage(initialLang);

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const lang = button.dataset.lang;
    if (!translations[lang]) {
      return;
    }
    applyLanguage(lang);
    localStorage.setItem(LANG_KEY, lang);
  });
});

