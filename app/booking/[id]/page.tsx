'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type BookingData = {
  id: string;
  appointmentDate: string;
  appointmentHour: number;
  appointmentMinute: number;
  durationHours: number;
  durationMinutes: number;
  service: string;
  status: string;
  businessName: string;
};

type Language = 'EN' | 'ES' | 'FR' | 'PT';

const translations = {
  yourAppointment: {
    EN: 'Your Appointment',
    ES: 'Tu Cita',
    FR: 'Votre Rendez-vous',
    PT: 'Seu Agendamento',
  },
  date: {
    EN: 'Date',
    ES: 'Fecha',
    FR: 'Date',
    PT: 'Data',
  },
  time: {
    EN: 'Time',
    ES: 'Hora',
    FR: 'Heure',
    PT: 'Horário',
  },
  duration: {
    EN: 'Duration',
    ES: 'Duración',
    FR: 'Durée',
    PT: 'Duração',
  },
  service: {
    EN: 'Service',
    ES: 'Servicio',
    FR: 'Service',
    PT: 'Serviço',
  },
  status: {
    EN: 'Status',
    ES: 'Estado',
    FR: 'Statut',
    PT: 'Status',
  },
  pending: {
    EN: 'Scheduled',
    ES: 'Programada',
    FR: 'Planifié',
    PT: 'Agendado',
  },
  completed: {
    EN: 'Completed',
    ES: 'Completada',
    FR: 'Terminé',
    PT: 'Concluído',
  },
  canceled: {
    EN: 'Canceled',
    ES: 'Cancelada',
    FR: 'Annulé',
    PT: 'Cancelado',
  },
  expired: {
    EN: 'This appointment has been completed',
    ES: 'Esta cita ha sido completada',
    FR: 'Ce rendez-vous a été terminé',
    PT: 'Este agendamento foi concluído',
  },
  notFound: {
    EN: 'Appointment not found',
    ES: 'Cita no encontrada',
    FR: 'Rendez-vous non trouvé',
    PT: 'Agendamento não encontrado',
  },
  loading: {
    EN: 'Loading...',
    ES: 'Cargando...',
    FR: 'Chargement...',
    PT: 'Carregando...',
  },
  lastUpdated: {
    EN: 'Last updated',
    ES: 'Última actualización',
    FR: 'Dernière mise à jour',
    PT: 'Última atualização',
  },
  autoRefresh: {
    EN: 'Auto-refreshes every 15 seconds',
    ES: 'Actualización automática cada 15 segundos',
    FR: 'Actualisation automatique toutes les 15 secondes',
    PT: 'Atualização automática a cada 15 segundos',
  },
};

function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  const m = minute.toString().padStart(2, '0');
  return `${hour12}:${m} ${ampm}`;
}

function formatDuration(hours: number, minutes: number): string {
  let result = '';
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;
  return result.trim() || '0m';
}

function formatDate(dateStr: string, lang: Language): string {
  const date = new Date(dateStr);
  const locales: Record<Language, string> = {
    EN: 'en-US',
    ES: 'es-ES',
    FR: 'fr-FR',
    PT: 'pt-BR',
  };
  return date.toLocaleDateString(locales[lang], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BookingPage() {
  const params = useParams();
  const id = params?.id as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [language, setLanguage] = useState<Language>('EN');

  const t = (key: keyof typeof translations) => translations[key][language];

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/booking/${id}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to fetch booking');
        setBooking(null);
      } else {
        setBooking(data.data);
        setError(null);
      }
      setLastUpdated(new Date());
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBooking();

      // Poll every 15 seconds for updates (only if not completed)
      const interval = setInterval(() => {
        if (booking?.status !== 'Completed') {
          fetchBooking();
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [id, booking?.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending':
        return t('pending');
      case 'Completed':
        return t('completed');
      case 'Canceled':
        return t('canceled');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">{t('notFound')}</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="EN">English</option>
          <option value="ES">Español</option>
          <option value="FR">Français</option>
          <option value="PT">Português</option>
        </select>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('yourAppointment')}</h1>
          <p className="text-pink-600 font-medium mt-1">{booking.businessName}</p>
        </div>

        {/* Expired Notice */}
        {booking.status === 'Completed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-green-700">{t('expired')}</p>
          </div>
        )}

        {/* Appointment Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Status Banner */}
          <div className={`px-6 py-3 border-b ${getStatusColor(booking.status)}`}>
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                booking.status === 'Pending' ? 'bg-amber-500' :
                booking.status === 'Completed' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="font-medium">{getStatusText(booking.status)}</span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-5">
            {/* Date */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('date')}</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(booking.appointmentDate, language)}
              </p>
            </div>

            {/* Time & Duration Row */}
            <div className="flex gap-6">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{t('time')}</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatTime(booking.appointmentHour, booking.appointmentMinute)}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{t('duration')}</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatDuration(booking.durationHours, booking.durationMinutes)}
                </p>
              </div>
            </div>

            {/* Service */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('service')}</p>
              <p className="text-lg font-semibold text-gray-800">{booking.service}</p>
            </div>
          </div>
        </div>

        {/* Auto-refresh Notice */}
        {booking.status !== 'Completed' && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              {t('autoRefresh')}
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-1">
                {t('lastUpdated')}: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Powered by Nails Salon Connect
          </p>
        </div>
      </div>
    </div>
  );
}
