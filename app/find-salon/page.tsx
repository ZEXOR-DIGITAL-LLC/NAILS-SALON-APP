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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">{t('back')}</span>
            </Link>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="EN">English</option>
              <option value="ES">Espanol</option>
              <option value="FR">Francais</option>
              <option value="PT">Portugues</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-gray-400">Powered by Nails Salon Connect</p>
        </div>
      </div>
    </div>
  );
}
