const themeToggle = document.getElementById('themeToggle');
const langSelect = document.getElementById('langSelect');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

// Theme toggle
const storedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.dataset.theme = storedTheme;
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
});

// Translations
const translations = {
  fr: {
    nav: {home: 'Accueil', about: 'À propos', services: 'Services', projects: 'Projets', contact: 'Contact'},
    hero: {
      title: 'Ingénierie & Web, au service du réel.',
      subtitle: "Je m'appelle Benjamin, je suis étudiant en ingénierie industrielle, autoformé au web et engagé pour construire un monde meilleur",
      ctaProjects: 'Voir mes projets',
      ctaContact: 'Me contacter'
    },
    about: {
      title: 'À propos',
      p1: "Je m’appelle <strong>Benjamin Reuland</strong>. Je suis étudiant en <strong>ingénierie industrielle</strong> à Liège, avec une affinité marquée pour l’<strong>électronique</strong>, les <strong>systèmes embarqués</strong> et l’intégration web. J’aime les projets concrets : partir d’un besoin, livrer un prototype mesurable, itérer vite et documenter proprement.",
      p2: "Côté <strong>web</strong>, je conçois des sites statiques et des interfaces sobres, <strong>performantes</strong> (accessibilité, SEO, temps de chargement), faciles à prendre en main. Côté <strong>ingénierie</strong>, je bricole capteurs, microcontrôleurs et API pour connecter le terrain au web (proofs of concept, IoT léger, dashboards). Mon critère : un impact réel pour des <strong>associations</strong>, des <strong>artisans</strong> et des projets <strong>éducatifs</strong>.",
      p3: "Je privilégie des solutions <strong>claires</strong> et <strong>maintenables</strong> plutôt que des effets tape-à-l’œil. Si votre idée implique du hardware léger, un peu de code et une livraison rapide, on est alignés.",
      goal1: 'Stage en électronique/embarqués',
      goal2: 'Missions freelance web',
      goal3: 'Partenariats éducatifs',
      goal4: 'Projets citoyens'
    },
    services: {
      title: 'Services',
      s1: {title: 'Sites WordPress collaboratifs', desc: 'De l’idée au site livré : design clair, contenus optimisés, formation à la prise en main. Vous repartez autonome.'},
      s2: {title: 'Sites statiques rapides', desc: 'Pages ultra-performantes (SEO, accessibilité) déployées en quelques minutes sur Plesk. Zéro maintenance.'},
      s3: {title: 'Prototypage embarqué / Conseil tech', desc: 'Électronique, capteurs, intégration web : je fais décoller vos idées avec des preuves de concept mesurables.'}
    },
    projects: {
      title: 'Projets',
      desc: 'Quelques réalisations web et embarquées.',
      p1: 'Site statique optimisé SEO pour une association locale.',
      p2: 'Visualisation de capteurs embarqués via API et interface web.',
      p3: 'Intégration e-commerce légère pour artisan.'
    },
    contact: {
      title: 'Contact',
      form: {
        lastname: 'Nom*',
        firstname: 'Prénom*',
        email: 'Adresse e-mail*',
        phone: 'Téléphone',
        message: 'Message*',
        consent: 'J’accepte que mes données soient utilisées pour me recontacter (RGPD).',
        submit: 'Envoyer'
      }
    },
    footer: {
      rights: '© <span id="year"></span> Benjamin Reuland. Tous droits réservés.',
      legal: 'Mentions légales'
    }
  },
  en: {
    nav: {home: 'Home', about: 'About', services: 'Services', projects: 'Projects', contact: 'Contact'},
    hero: {
      title: 'Engineering & Web, serving the real world.',
      subtitle: "I'm Benjamin, an industrial engineering student, self-taught in web, committed to building a better world",
      ctaProjects: 'See my projects',
      ctaContact: 'Contact me'
    },
    about: {
      title: 'About',
      p1: "My name is <strong>Benjamin Reuland</strong>. I'm an <strong>industrial engineering</strong> student in Liège with a strong affinity for <strong>electronics</strong>, <strong>embedded systems</strong> and web integration. I like concrete projects: start from a need, deliver a measurable prototype, iterate fast and document cleanly.",
      p2: "On the <strong>web</strong> side, I design static sites and sober, <strong>high-performance</strong> interfaces (accessibility, SEO, load time) that are easy to use. On the <strong>engineering</strong> side, I tinker with sensors, microcontrollers and APIs to connect the field to the web (proofs of concept, light IoT, dashboards). My criterion: real impact for <strong>associations</strong>, <strong>craftspeople</strong> and <strong>educational projects</strong>.",
      p3: "I favor <strong>clear</strong> and <strong>maintainable</strong> solutions over flashy effects. If your idea involves light hardware, some code and fast delivery, we're aligned.",
      goal1: 'Internship in electronics/embedded',
      goal2: 'Freelance web missions',
      goal3: 'Educational partnerships',
      goal4: 'Citizen projects'
    },
    services: {
      title: 'Services',
      s1: {title: 'Collaborative WordPress sites', desc: 'From idea to delivered site: clear design, optimized content, training to take control. You leave autonomous.'},
      s2: {title: 'Fast static sites', desc: 'Ultra-performant pages (SEO, accessibility) deployed in minutes on Plesk. Zero maintenance.'},
      s3: {title: 'Embedded prototyping / Tech consulting', desc: 'Electronics, sensors, web integration: I boost your ideas with measurable proofs of concept.'}
    },
    projects: {
      title: 'Projects',
      desc: 'Some web and embedded achievements.',
      p1: 'SEO-optimized static site for a local association.',
      p2: 'Visualization of embedded sensors via API and web interface.',
      p3: 'Light e-commerce integration for a craftsman.'
    },
    contact: {
      title: 'Contact',
      form: {
        lastname: 'Last name*',
        firstname: 'First name*',
        email: 'Email address*',
        phone: 'Phone',
        message: 'Message*',
        consent: 'I agree that my data may be used to contact me (GDPR).',
        submit: 'Send'
      }
    },
    footer: {
      rights: '© <span id="year"></span> Benjamin Reuland. All rights reserved.',
      legal: 'Legal notice'
    }
  },
  nl: {
    nav: {home: 'Start', about: 'Over mij', services: 'Diensten', projects: 'Projecten', contact: 'Contact'},
    hero: {
      title: 'Engineering & Web, in dienst van het echte.',
      subtitle: 'Ik ben Benjamin, student industriële ingenieur, autodidact in het web en betrokken om een betere wereld te bouwen',
      ctaProjects: 'Bekijk mijn projecten',
      ctaContact: 'Neem contact op'
    },
    about: {
      title: 'Over mij',
      p1: 'Ik heet <strong>Benjamin Reuland</strong>. Ik studeer <strong>industriële ingenieurswetenschappen</strong> in Luik, met een sterke affiniteit voor <strong>elektronica</strong>, <strong>embedded systemen</strong> en webintegratie. Ik hou van concrete projecten: vertrekken van een behoefte, een meetbaar prototype leveren, snel itereren en netjes documenteren.',
      p2: 'Aan de <strong>web</strong>-kant bouw ik statische sites en sobere, <strong>performante</strong> interfaces (toegankelijkheid, SEO, laadtijd) en gemakkelijk in gebruik. Aan de <strong>engineering</strong>-kant knutsel ik met sensoren, microcontrollers en API\'s om het terrein met het web te verbinden (proofs of concept, lichte IoT, dashboards). Mijn criterium: een echte impact voor <strong>verenigingen</strong>, <strong>ambachtslieden</strong> en <strong>educatieve projecten</strong>.',
      p3: 'Ik verkies <strong>duidelijke</strong> en <strong>onderhoudbare</strong> oplossingen boven opzichtig effect. Als uw idee lichte hardware, wat code en snelle levering inhoudt, zitten we op één lijn.',
      goal1: 'Stage in elektronica/embedded',
      goal2: 'Freelance webopdrachten',
      goal3: 'Educatieve partnerschappen',
      goal4: 'Burgerprojecten'
    },
    services: {
      title: 'Diensten',
      s1: {title: 'Collaboratieve WordPress-sites', desc: 'Van idee tot levering: helder design, geoptimaliseerde inhoud, opleiding om zelf verder te kunnen. Je vertrekt zelfstandig.'},
      s2: {title: 'Snelle statische sites', desc: 'Ultrasnelle pagina\'s (SEO, toegankelijkheid) in enkele minuten uitgerold op Plesk. Geen onderhoud.'},
      s3: {title: 'Embedded prototyping / Techadvies', desc: 'Elektronica, sensoren, webintegratie: ik laat je ideeën vliegen met meetbare proof of concepts.'}
    },
    projects: {
      title: 'Projecten',
      desc: 'Enkele web- en embeddedrealisaties.',
      p1: 'SEO-geoptimaliseerde statische site voor een lokale vereniging.',
      p2: 'Visualisatie van sensoren via API en webinterface.',
      p3: 'Lichte e-commercemodule voor een vakman.'
    },
    contact: {
      title: 'Contact',
      form: {
        lastname: 'Naam*',
        firstname: 'Voornaam*',
        email: 'E-mailadres*',
        phone: 'Telefoon',
        message: 'Bericht*',
        consent: 'Ik ga ermee akkoord dat mijn gegevens worden gebruikt om contact met mij op te nemen (AVG).',
        submit: 'Verzenden'
      }
    },
    footer: {
      rights: '© <span id="year"></span> Benjamin Reuland. Alle rechten voorbehouden.',
      legal: 'Wettelijke vermeldingen'
    }
  },
  de: {
    nav: {home: 'Start', about: 'Über mich', services: 'Leistungen', projects: 'Projekte', contact: 'Kontakt'},
    hero: {
      title: 'Ingenieurwesen & Web, im Dienst des Realen.',
      subtitle: 'Ich heiße Benjamin, bin Student der Industrieingenieurwissenschaften, autodidaktischer Webentwickler und engagiert, eine bessere Welt zu bauen',
      ctaProjects: 'Meine Projekte ansehen',
      ctaContact: 'Kontakt aufnehmen'
    },
    about: {
      title: 'Über mich',
      p1: 'Ich heiße <strong>Benjamin Reuland</strong>. Ich studiere <strong>Industrieingenieurwesen</strong> in Lüttich, mit besonderer Affinität zu <strong>Elektronik</strong>, <strong>Embedded-Systemen</strong> und Webintegration. Ich mag konkrete Projekte: von einem Bedarf ausgehen, einen messbaren Prototyp liefern, schnell iterieren und sauber dokumentieren.',
      p2: 'Im Bereich <strong>Web</strong> entwerfe ich statische Websites und schlichte, <strong>leistungsfähige</strong> Interfaces (Barrierefreiheit, SEO, Ladezeit), die leicht zu handhaben sind. Im Bereich <strong>Engineering</strong> bastle ich mit Sensoren, Mikrocontrollern und APIs, um das Feld mit dem Web zu verbinden (Proofs of Concept, leichtes IoT, Dashboards). Mein Kriterium: realer Impact für <strong>Vereine</strong>, <strong>Handwerker</strong> und <strong>Bildungsprojekte</strong>.',
      p3: 'Ich bevorzuge <strong>klare</strong> und <strong>wartbare</strong> Lösungen statt Effekthascherei. Wenn Ihre Idee leichte Hardware, etwas Code und schnelle Lieferung erfordert, sind wir auf einer Linie.',
      goal1: 'Praktikum in Elektronik/Embedded',
      goal2: 'Freelance-Webaufträge',
      goal3: 'Bildungspartnerschaften',
      goal4: 'Bürgerprojekte'
    },
    services: {
      title: 'Leistungen',
      s1: {title: 'Kollaborative WordPress-Seiten', desc: 'Von der Idee bis zur fertigen Seite: klares Design, optimierte Inhalte, Schulung zur eigenständigen Nutzung. Sie bleiben autonom.'},
      s2: {title: 'Schnelle statische Seiten', desc: 'Ultraperformante Seiten (SEO, Barrierefreiheit) in wenigen Minuten auf Plesk bereitgestellt. Null Wartung.'},
      s3: {title: 'Embedded-Prototyping / Tech-Beratung', desc: 'Elektronik, Sensoren, Webintegration: Ich bringe Ihre Ideen mit messbaren Proofs of Concept zum Abheben.'}
    },
    projects: {
      title: 'Projekte',
      desc: 'Einige Web- und Embedded-Umsetzungen.',
      p1: 'SEO-optimierte statische Seite für einen lokalen Verein.',
      p2: 'Visualisierung von Sensordaten über API und Webinterface.',
      p3: 'Leichter E-Commerce für Handwerker.'
    },
    contact: {
      title: 'Kontakt',
      form: {
        lastname: 'Nachname*',
        firstname: 'Vorname*',
        email: 'E-Mail-Adresse*',
        phone: 'Telefon',
        message: 'Nachricht*',
        consent: 'Ich stimme zu, dass meine Daten zur Kontaktaufnahme verwendet werden (DSGVO).',
        submit: 'Senden'
      }
    },
    footer: {
      rights: '© <span id="year"></span> Benjamin Reuland. Alle Rechte vorbehalten.',
      legal: 'Impressum'
    }
  },
  se: {
    nav: {home: 'Hem', about: 'Om mig', services: 'Tjänster', projects: 'Projekt', contact: 'Kontakt'},
    hero: {
      title: 'Ingenjörskonst & Web, i verklighetens tjänst.',
      subtitle: 'Jag heter Benjamin, studerar industriell ingenjörskonst, självlärd i webben och engagerad i att bygga en bättre värld',
      ctaProjects: 'Se mina projekt',
      ctaContact: 'Kontakta mig'
    },
    about: {
      title: 'Om mig',
      p1: 'Jag heter <strong>Benjamin Reuland</strong>. Jag studerar <strong>industriell ingenjörskonst</strong> i Liège med särskilt intresse för <strong>elektronik</strong>, <strong>inbyggda system</strong> och webbintegration. Jag gillar konkreta projekt: utgå från ett behov, leverera en mätbar prototyp, iterera snabbt och dokumentera tydligt.',
      p2: 'På <strong>webb</strong>-sidan bygger jag statiska webbplatser och avskalade, <strong>presterande</strong> gränssnitt (tillgänglighet, SEO, laddningstid) som är lätta att använda. På <strong>ingenjörs</strong>-sidan experimenterar jag med sensorer, mikrokontroller och API:er för att koppla verkligheten till webben (proof of concept, lätt IoT, dashboards). Mitt kriterium: verklig påverkan för <strong>föreningar</strong>, <strong>hantverkare</strong> och <strong>pedagogiska projekt</strong>.',
      p3: 'Jag föredrar <strong>tydliga</strong> och <strong>lättunderhållna</strong> lösningar framför bländande effekter. Om din idé innebär lätt hårdvara, lite kod och snabb leverans är vi på samma linje.',
      goal1: 'Praktik inom elektronik/inbyggt',
      goal2: 'Frilansuppdrag på webben',
      goal3: 'Pedagogiska samarbeten',
      goal4: 'Medborgarprojekt'
    },
    services: {
      title: 'Tjänster',
      s1: {title: 'Samarbetande WordPress-sajter', desc: 'Från idé till levererad sajt: tydlig design, optimerat innehåll, utbildning för egen hantering. Du går därifrån självständig.'},
      s2: {title: 'Snabba statiska sajter', desc: 'Ultrapresterande sidor (SEO, tillgänglighet) som distribueras på några minuter på Plesk. Ingen underhåll.'},
      s3: {title: 'Inbyggd prototypning / Techrådgivning', desc: 'Elektronik, sensorer, webbintegration: jag får dina idéer att lyfta med mätbara proof of concept.'}
    },
    projects: {
      title: 'Projekt',
      desc: 'Några webboch inbyggda realisationer.',
      p1: 'SEO-optimerad statisk sajt för en lokal förening.',
      p2: 'Visualisering av sensorsdata via API och webbgränssnitt.',
      p3: 'Lätt e-handelsintegration för hantverkare.'
    },
    contact: {
      title: 'Kontakt',
      form: {
        lastname: 'Efternamn*',
        firstname: 'Förnamn*',
        email: 'E-postadress*',
        phone: 'Telefon',
        message: 'Meddelande*',
        consent: 'Jag samtycker till att mina uppgifter används för att kontakta mig (GDPR).',
        submit: 'Skicka'
      }
    },
    footer: {
      rights: '© <span id="year"></span> Benjamin Reuland. Alla rättigheter förbehållna.',
      legal: 'Juridisk information'
    }
  }
};

function applyTranslations(lang) {
  const dict = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keys = el.dataset.i18n.split('.');
    let text = dict;
    keys.forEach(k => { if (text) text = text[k]; });
    if (text) el.innerHTML = text;
  });
  document.documentElement.lang = lang;
}

const storedLang = localStorage.getItem('lang') || 'fr';
langSelect.value = storedLang;
applyTranslations(storedLang);

langSelect.addEventListener('change', e => {
  const lang = e.target.value;
  applyTranslations(lang);
  localStorage.setItem('lang', lang);
});

// Mobile menu
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open);
  });
}

// Background dots
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height, dots = [];
const mouse = {x: 0, y: 0};

function initCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  dots = [];
  for (let i = 0; i < 60; i++) {
    dots.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  const color = getComputedStyle(document.documentElement).getPropertyValue('--text');
  dots.forEach(d => {
    d.x += d.vx + (mouse.x - d.x) * 0.0005;
    d.y += d.vy + (mouse.y - d.y) * 0.0005;
    if (d.x < 0 || d.x > width) d.vx *= -1;
    if (d.y < 0 || d.y > height) d.vy *= -1;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
  requestAnimationFrame(draw);
}

window.addEventListener('resize', initCanvas);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
initCanvas();
draw();

// Year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
