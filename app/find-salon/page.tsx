'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Language = 'EN' | 'ES' | 'FR' | 'PT';

type Salon = {
  id: string;
  businessName: string;
  businessImage: string | null;
  type: string;
  address: string;
  city: string;
  country: string;
  isOpen: boolean;
};

const translations = {
  title: {
    EN: 'Find a Beauty Salon',
    ES: 'Encuentra un Salon de Belleza',
    FR: 'Trouver un Salon de Beaute',
    PT: 'Encontrar um Salao de Beleza',
  },
  subtitle: {
    EN: 'Discover salons near you and book an appointment',
    ES: 'Descubre salones cerca de ti y reserva una cita',
    FR: 'Decouvrez les salons pres de chez vous et prenez rendez-vous',
    PT: 'Descubra saloes perto de voce e agende um horario',
  },
  selectCountry: {
    EN: 'Select Country',
    ES: 'Seleccionar Pais',
    FR: 'Selectionner le Pays',
    PT: 'Selecionar Pais',
  },
  selectCity: {
    EN: 'Select City',
    ES: 'Seleccionar Ciudad',
    FR: 'Selectionner la Ville',
    PT: 'Selecionar Cidade',
  },
  bookNow: {
    EN: 'Book Now',
    ES: 'Reservar',
    FR: 'Reserver',
    PT: 'Agendar',
  },
  closed: {
    EN: 'Closed',
    ES: 'Cerrado',
    FR: 'Ferme',
    PT: 'Fechado',
  },
  open: {
    EN: 'Open',
    ES: 'Abierto',
    FR: 'Ouvert',
    PT: 'Aberto',
  },
  noSalons: {
    EN: 'No salons found in this location.',
    ES: 'No se encontraron salones en esta ubicacion.',
    FR: 'Aucun salon trouve dans cette localisation.',
    PT: 'Nenhum salao encontrado nesta localizacao.',
  },
  loading: {
    EN: 'Loading...',
    ES: 'Cargando...',
    FR: 'Chargement...',
    PT: 'Carregando...',
  },
  back: {
    EN: 'Back to Home',
    ES: 'Volver al Inicio',
    FR: 'Retour a l\'Accueil',
    PT: 'Voltar ao Inicio',
  },
  chooseCountry: {
    EN: '-- Choose a country --',
    ES: '-- Elige un pais --',
    FR: '-- Choisissez un pays --',
    PT: '-- Escolha um pais --',
  },
  chooseCity: {
    EN: '-- Choose a city --',
    ES: '-- Elige una ciudad --',
    FR: '-- Choisissez une ville --',
    PT: '-- Escolha uma cidade --',
  },
  selectBoth: {
    EN: 'Select a country and city to see available salons.',
    ES: 'Selecciona un pais y una ciudad para ver los salones disponibles.',
    FR: 'Selectionnez un pays et une ville pour voir les salons disponibles.',
    PT: 'Selecione um pais e uma cidade para ver os saloes disponiveis.',
  },
};

const navTranslations = {
  features: { EN: 'Features', ES: 'Funciones', FR: 'Fonctionnalités', PT: 'Recursos' },
  howItWorks: { EN: 'How It Works', ES: 'Cómo Funciona', FR: 'Comment Ça Marche', PT: 'Como Funciona' },
  faq: { EN: 'FAQ', ES: 'Preguntas', FR: 'FAQ', PT: 'Perguntas' },
  findSalon: { EN: 'Find a Salon', ES: 'Buscar Salon', FR: 'Trouver un Salon', PT: 'Encontrar Salao' },
  download: { EN: 'Download App', ES: 'Descargar App', FR: "Télécharger", PT: 'Baixar App' },
};

const footerTranslations = {
  privacy: { EN: 'Privacy Policy', ES: 'Política de Privacidad', FR: 'Politique de Confidentialité', PT: 'Política de Privacidade' },
  terms: { EN: 'Terms of Service', ES: 'Términos de Servicio', FR: "Conditions d'Utilisation", PT: 'Termos de Serviço' },
  cookie: { EN: 'Cookie Policy', ES: 'Política de Cookies', FR: 'Politique de Cookies', PT: 'Política de Cookies' },
  contact: { EN: 'Contact', ES: 'Contacto', FR: 'Contact', PT: 'Contato' },
};

const langTooltip: Record<Language, string> = {
  EN: 'Switch language anytime',
  ES: 'Cambia el idioma cuando quieras',
  FR: 'Changez de langue à tout moment',
  PT: 'Mude o idioma quando quiser',
};

const Icons = {
  Globe: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  Menu: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
};

function LanguageSwitcher({ language, setLanguage }: { language: Language; setLanguage: (lang: Language) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const languages: { code: Language; label: string }[] = [
    { code: 'EN', label: 'English' },
    { code: 'ES', label: 'Español' },
    { code: 'FR', label: 'Français' },
    { code: 'PT', label: 'Português' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
        title={langTooltip[language]}
      >
        <Icons.Globe className="w-4 h-4" />
        <span>{language}</span>
        <Icons.ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-rose-50 transition-colors ${language === lang.code ? 'text-rose-600 font-semibold bg-rose-50' : 'text-gray-700'}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SubpageHeader({ language, setLanguage }: { language: Language; setLanguage: (lang: Language) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20' : 'bg-white/80 backdrop-blur-md'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-3">
            <Image
              src="/nails-salon.png"
              alt="Nails Salon Logo"
              width={44}
              height={44}
              className="rounded-xl shadow-lg shadow-rose-200/50"
            />
            <span className="font-serif font-bold text-2xl text-gray-900 tracking-tight">Nails Salon</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors">{navTranslations.features[language]}</a>
            <a href="/#how-it-works" className="text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors">{navTranslations.howItWorks[language]}</a>
            <a href="/#faq" className="text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors">{navTranslations.faq[language]}</a>
            <a href="/find-salon" className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors">{navTranslations.findSalon[language]}</a>
            <div className="w-px h-5 bg-gray-200"></div>
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
            <a href="/#download" className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              {navTranslations.download[language]}
            </a>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              {mobileMenuOpen ? <Icons.X className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100 bg-white/95 backdrop-blur-lg absolute left-0 right-0 px-4 shadow-xl rounded-b-3xl">
            <div className="flex flex-col gap-4">
              <a href="/#features" className="text-left font-medium text-lg text-gray-600 hover:text-rose-600 py-2">{navTranslations.features[language]}</a>
              <a href="/#how-it-works" className="text-left font-medium text-lg text-gray-600 hover:text-rose-600 py-2">{navTranslations.howItWorks[language]}</a>
              <a href="/#faq" className="text-left font-medium text-lg text-gray-600 hover:text-rose-600 py-2">{navTranslations.faq[language]}</a>
              <a href="/find-salon" className="text-left font-medium text-lg text-rose-600 hover:text-rose-700 py-2">{navTranslations.findSalon[language]}</a>
              <a href="/#download" className="bg-gray-900 text-white px-4 py-3.5 rounded-xl text-center font-medium shadow-lg mt-2">
                {navTranslations.download[language]}
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function SubpageFooter({ language }: { language: Language }) {
  return (
    <footer className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <a href="/" className="flex items-center gap-3">
            <Image
              src="/nails-salon.png"
              alt="Nails Salon Logo"
              width={32}
              height={32}
              className="rounded-lg grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
            />
            <span className="font-bold text-gray-400">Nails Salon</span>
          </a>

          <div className="flex items-center gap-8 text-sm text-gray-500 font-medium">
            <a href="/privacy-policy" className="hover:text-rose-600 transition-colors">{footerTranslations.privacy[language]}</a>
            <a href="/cookie-policy" className="hover:text-rose-600 transition-colors">{footerTranslations.cookie[language]}</a>
            <a href="/terms-of-service" className="hover:text-rose-600 transition-colors">{footerTranslations.terms[language]}</a>
            <a href="#" className="hover:text-rose-600 transition-colors">{footerTranslations.contact[language]}</a>
          </div>

          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Nails Salon.</p>
        </div>
      </div>
    </footer>
  );
}

export default function FindSalonPage() {
  const [language, setLanguage] = useState<Language>('EN');
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingSalons, setLoadingSalons] = useState(false);

  const t = (key: keyof typeof translations) => translations[key][language];

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry);
    } else {
      setCities([]);
      setSelectedCity('');
      setSalons([]);
    }
  }, [selectedCountry]);

  // Fetch salons when city changes
  useEffect(() => {
    if (selectedCountry && selectedCity) {
      fetchSalons(selectedCountry, selectedCity);
    } else {
      setSalons([]);
    }
  }, [selectedCity]);

  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch('/api/find-salon');
      const data = await response.json();
      if (data.success) {
        setCountries(data.countries);
      }
    } catch {
      console.error('Failed to fetch countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchCities = async (country: string) => {
    setLoadingCities(true);
    setCities([]);
    setSelectedCity('');
    setSalons([]);
    try {
      const response = await fetch(`/api/find-salon?country=${encodeURIComponent(country)}`);
      const data = await response.json();
      if (data.success) {
        setCities(data.cities);
      }
    } catch {
      console.error('Failed to fetch cities');
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchSalons = async (country: string, city: string) => {
    setLoadingSalons(true);
    try {
      const response = await fetch(`/api/find-salon?country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}`);
      const data = await response.json();
      if (data.success) {
        setSalons(data.salons);
      }
    } catch {
      console.error('Failed to fetch salons');
    } finally {
      setLoadingSalons(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <SubpageHeader language={language} setLanguage={setLanguage} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{t('title')}</h1>
          <p className="text-gray-500 text-lg">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Country Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectCountry')}</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                disabled={loadingCountries}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-800 disabled:opacity-50"
              >
                <option value="">{t('chooseCountry')}</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectCity')}</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedCountry || loadingCities}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-800 disabled:opacity-50"
              >
                <option value="">{loadingCities ? t('loading') : t('chooseCity')}</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loadingSalons ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">{t('loading')}</p>
          </div>
        ) : selectedCountry && selectedCity ? (
          salons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {salons.map((salon) => (
                <div
                  key={salon.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Salon Image */}
                  <div className="relative h-40 bg-gradient-to-br from-rose-100 to-pink-50">
                    {salon.businessImage ? (
                      <Image
                        src={salon.businessImage}
                        alt={salon.businessName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                      salon.isOpen
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {salon.isOpen ? t('open') : t('closed')}
                    </div>
                  </div>

                  {/* Salon Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{salon.businessName}</h3>
                    <p className="text-sm text-rose-600 font-medium mb-1 capitalize">{salon.type}</p>
                    <p className="text-sm text-gray-500 mb-4">{salon.address}</p>

                    <Link
                      href={`/book/${salon.id}`}
                      className="block w-full text-center bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl font-medium transition-colors text-sm"
                    >
                      {t('bookNow')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 text-lg">{t('noSalons')}</p>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 text-lg">{t('selectBoth')}</p>
          </div>
        )}

      </div>

      <SubpageFooter language={language} />
    </div>
  );
}
