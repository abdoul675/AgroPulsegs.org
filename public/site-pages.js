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
    void submitContactForm(contactForm);
  });
}

async function submitContactForm(form) {
  if (form.dataset.submitting === 'true') return;
  form.dataset.submitting = 'true';
  form.setAttribute('aria-busy', 'true');
  const submitButton = form.querySelector('button[type="submit"]');
  const status = document.getElementById('form-status');
  const wasDisabled = submitButton.disabled;
  submitButton.disabled = true;
  status.textContent = language === 'fr' ? 'Envoi en cours…' : 'Sending…';

  const formData = new FormData(form);
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    organization: formData.get('organization'),
    type: formData.get('type'),
    message: formData.get('message'),
    website: formData.get('website'),
    consent: formData.get('consent') === 'on',
    locale: language,
  };

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || result.ok !== true) {
      if (response.status === 429) {
        const wait = Number(result.retryAfter || response.headers.get('Retry-After'));
        const minutes = Math.ceil((Number.isFinite(wait) && wait > 0 ? Math.min(wait, 900) : 60) / 60);
        status.textContent = language === 'fr'
          ? 'Veuillez patienter ' + minutes + ' min avant de réessayer. Vos informations sont conservées.'
          : 'Please wait ' + minutes + ' min before trying again. Your entries have been kept.';
      } else if (response.status === 503) {
        status.textContent = language === 'fr'
          ? 'Le service de réception des demandes n’est pas encore configuré. Veuillez réessayer plus tard.'
          : 'The request delivery service is not configured yet. Please try again later.';
      } else {
        status.textContent = language === 'fr'
          ? 'L’envoi a échoué. Vérifiez le formulaire puis réessayez.'
          : 'The request could not be sent. Check the form and try again.';
      }
      return;
    }

    form.reset();
    status.textContent = language === 'fr'
      ? 'Votre demande a bien été envoyée à AgroPulse.'
      : 'Your request has been sent to AgroPulse.';
  } catch {
    status.textContent = language === 'fr'
      ? 'Impossible de joindre le service. Vérifiez votre connexion puis réessayez.'
      : 'The delivery service could not be reached. Check your connection and try again.';
  } finally {
    submitButton.disabled = wasDisabled;
    delete form.dataset.submitting;
    form.removeAttribute('aria-busy');
  }
}

setLanguage(language);
