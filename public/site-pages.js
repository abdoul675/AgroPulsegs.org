const languageButton = document.getElementById('language-switch');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('primary-navigation');
let language = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'fr';

function setLanguage(nextLanguage) {
  if (nextLanguage !== 'fr' && nextLanguage !== 'en') {
    throw new RangeError(`Unsupported language: ${nextLanguage}`);
  }

  for (const element of document.querySelectorAll('[data-fr][data-en]')) {
    element.textContent = element.dataset[nextLanguage];
  }

  for (const image of document.querySelectorAll('[data-alt-fr][data-alt-en]')) {
    image.alt = image.dataset[`alt${nextLanguage === 'fr' ? 'Fr' : 'En'}`];
  }

  document.documentElement.lang = nextLanguage;
  document.title = document.body.dataset[`title${nextLanguage === 'fr' ? 'Fr' : 'En'}`];
  const description = document.querySelector('meta[name="description"]');
  description.content = description.dataset[`description${nextLanguage === 'fr' ? 'Fr' : 'En'}`] ?? description.content;
  navigation.setAttribute('aria-label', navigation.dataset[`label${nextLanguage === 'fr' ? 'Fr' : 'En'}`]);
  languageButton.setAttribute('aria-label', languageButton.dataset[`label${nextLanguage === 'fr' ? 'Fr' : 'En'}`]);
  languageButton.textContent = nextLanguage === 'fr' ? 'EN' : 'FR';
  language = nextLanguage;
}

function closeNavigation() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = language === 'fr' ? 'Menu' : 'Menu';
}

languageButton.addEventListener('click', () => {
  const nextLanguage = language === 'fr' ? 'en' : 'fr';
  setLanguage(nextLanguage);
  const url = new URL(location.href);
  url.searchParams.set('lang', nextLanguage);
  history.replaceState(null, '', url);
  closeNavigation();
});

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen
    ? (language === 'fr' ? 'Fermer' : 'Close')
    : 'Menu';
});

navigation.addEventListener('click', event => {
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

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeNavigation();
    menuButton.focus();
  }
});

const contactForm = document.getElementById('request-form');
if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const draft = [
      `Type: ${formData.get('type')}`,
      `Name: ${formData.get('name')}`,
      `Email: ${formData.get('email')}`,
      `Organization: ${formData.get('organization') || '—'}`,
      '',
      String(formData.get('message')).trim(),
    ].join('\n');

    document.getElementById('request-draft').value = draft;
    document.getElementById('request-draft').hidden = false;
    document.getElementById('draft-label').hidden = false;
    document.getElementById('form-status').textContent = language === 'fr'
      ? 'Brouillon préparé sur cet appareil. Rien n’a été envoyé.'
      : 'Draft prepared on this device. Nothing was sent.';
  });
}

setLanguage(language);
