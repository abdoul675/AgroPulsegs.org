const translations = JSON.parse(document.getElementById('homepage-copy').textContent);
const languageSwitch = document.getElementById('language-switch');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.getElementById('primary-navigation');
let language = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'fr';

function setLanguage(nextLanguage) {
  const copy = translations[nextLanguage];
  if (!copy) throw new RangeError(`Unsupported language: ${nextLanguage}`);
  if (typeof copy.pageTitle !== 'string' || typeof copy.metaDescription !== 'string') {
    throw new Error(`Missing ${nextLanguage} page metadata`);
  }

  document.title = copy.pageTitle;
  document.querySelector('meta[name="description"]').setAttribute('content', copy.metaDescription);

  for (const element of document.querySelectorAll('[data-i18n]')) {
    const key = element.dataset.i18n;
    if (typeof copy[key] !== 'string') throw new Error(`Missing ${nextLanguage} translation: ${key}`);
    element.textContent = copy[key];
  }

  for (const element of document.querySelectorAll('[data-i18n-aria-label]')) {
    const key = element.dataset.i18nAriaLabel;
    if (typeof copy[key] !== 'string') throw new Error(`Missing ${nextLanguage} aria translation: ${key}`);
    element.setAttribute('aria-label', copy[key]);
  }

  for (const element of document.querySelectorAll('[data-i18n-alt]')) {
    const key = element.dataset.i18nAlt;
    if (typeof copy[key] !== 'string') throw new Error(`Missing ${nextLanguage} image alternative: ${key}`);
    element.alt = copy[key];
  }

  document.documentElement.lang = nextLanguage;
  language = nextLanguage;
  menuToggle.setAttribute('aria-expanded', String(navigation.classList.contains('is-open')));
}

function closeNavigation() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = translations[language].menu;
}

languageSwitch.addEventListener('click', () => {
  const nextLanguage = language === 'fr' ? 'en' : 'fr';
  setLanguage(nextLanguage);
  const url = new URL(location.href);
  url.searchParams.set('lang', nextLanguage);
  history.replaceState(null, '', url);
  closeNavigation();
});

menuToggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? translations[language].menuClose : translations[language].menu;
});

navigation.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  if (language === 'en') {
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin) {
      url.searchParams.set('lang', 'en');
      link.href = url;
    }
  }
  closeNavigation();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeNavigation();
    menuToggle.focus();
  }
});

setLanguage(language);
