'use client';

import { useState, useEffect, useRef } from 'react';
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
  clientName: string;
  queuePosition: number;
  totalQueueToday: number;
  createdAt: string;
  updatedAt: string;
};

type Language = 'EN' | 'ES' | 'FR' | 'PT';

const translations = {
  yourAppointment: {
    EN: 'Your Appointment',
    ES: 'Tu Cita',
    FR: 'Votre Rendez-vous',
    PT: 'Seu Agendamento',
  },
  liveStatus: {
    EN: 'Live Status',
    ES: 'Estado en Vivo',
    FR: 'Statut en Direct',
    PT: 'Status ao Vivo',
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
    PT: 'Horario',
  },
  duration: {
    EN: 'Duration',
    ES: 'Duracion',
    FR: 'Duree',
    PT: 'Duracao',
  },
  durationPending: {
    EN: 'Assigned by salon',
    ES: 'Asignada por el salon',
    FR: 'Attribuee par le salon',
    PT: 'Atribuida pelo salao',
  },
  service: {
    EN: 'Service',
    ES: 'Servicio',
    FR: 'Service',
    PT: 'Servico',
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
    FR: 'Planifie',
    PT: 'Agendado',
  },
  completed: {
    EN: 'Completed',
    ES: 'Completada',
    FR: 'Termine',
    PT: 'Concluido',
  },
  canceled: {
    EN: 'Canceled',
    ES: 'Cancelada',
    FR: 'Annule',
    PT: 'Cancelado',
  },
  expired: {
    EN: 'This appointment has been completed',
    ES: 'Esta cita ha sido completada',
    FR: 'Ce rendez-vous a ete termine',
    PT: 'Este agendamento foi concluido',
  },
  canceledMessage: {
    EN: 'This appointment has been canceled',
    ES: 'Esta cita ha sido cancelada',
    FR: 'Ce rendez-vous a ete annule',
    PT: 'Este agendamento foi cancelado',
  },
  notFound: {
    EN: 'Appointment not found',
    ES: 'Cita no encontrada',
    FR: 'Rendez-vous non trouve',
    PT: 'Agendamento nao encontrado',
  },
  loading: {
    EN: 'Loading...',
    ES: 'Cargando...',
    FR: 'Chargement...',
    PT: 'Carregando...',
  },
  lastUpdated: {
    EN: 'Last updated',
    ES: 'Ultima actualizacion',
    FR: 'Derniere mise a jour',
    PT: 'Ultima atualizacao',
  },
  autoRefresh: {
    EN: 'Auto-refreshes every 15 seconds',
    ES: 'Actualizacion automatica cada 15 segundos',
    FR: 'Actualisation automatique toutes les 15 secondes',
    PT: 'Atualizacao automatica a cada 15 segundos',
  },
  queuePosition: {
    EN: 'Your Position',
    ES: 'Tu Posicion',
    FR: 'Votre Position',
    PT: 'Sua Posicao',
  },
  inQueue: {
    EN: 'in queue',
    ES: 'en la fila',
    FR: 'dans la file',
    PT: 'na fila',
  },
  youAreNext: {
    EN: "You're Next!",
    ES: 'Eres el Siguiente!',
    FR: 'Vous etes le Suivant!',
    PT: 'Voce e o Proximo!',
  },
  peopleAhead: {
    EN: 'people ahead of you',
    ES: 'personas antes que tu',
    FR: 'personnes devant vous',
    PT: 'pessoas na sua frente',
  },
  personAhead: {
    EN: 'person ahead of you',
    ES: 'persona antes que tu',
    FR: 'personne devant vous',
    PT: 'pessoa na sua frente',
  },
  appointmentsToday: {
    EN: 'appointments today',
    ES: 'citas hoy',
    FR: 'rendez-vous aujourd\'hui',
    PT: 'agendamentos hoje',
  },
  timeUpdated: {
    EN: 'Time Updated',
    ES: 'Hora Actualizada',
    FR: 'Heure Mise a Jour',
    PT: 'Horario Atualizado',
  },
  appointmentMoved: {
    EN: 'Your appointment time was updated',
    ES: 'Tu hora de cita fue actualizada',
    FR: 'L\'heure de votre rendez-vous a ete mise a jour',
    PT: 'O horario do seu agendamento foi atualizado',
  },
  hello: {
    EN: 'Hello',
    ES: 'Hola',
    FR: 'Bonjour',
    PT: 'Ola',
  },
  thankYou: {
    EN: 'Thank you for your visit!',
    ES: 'Gracias por tu visita!',
    FR: 'Merci pour votre visite!',
    PT: 'Obrigado pela sua visita!',
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
  const [timeChanged, setTimeChanged] = useState(false);

  // Store initial booking time to detect changes
  const initialTimeRef = useRef<{ hour: number; minute: number } | null>(null);

  const t = (key: keyof typeof translations) => translations[key][language];

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/booking/${id}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to fetch booking');
        setBooking(null);
      } else {
        const newBooking = data.data;

        // Check if time changed from initial booking
        if (initialTimeRef.current) {
          if (
            initialTimeRef.current.hour !== newBooking.appointmentHour ||
            initialTimeRef.current.minute !== newBooking.appointmentMinute
          ) {
            setTimeChanged(true);
          }
        } else {
          // Store initial time on first load
          initialTimeRef.current = {
            hour: newBooking.appointmentHour,
            minute: newBooking.appointmentMinute,
          };
        }

        setBooking(newBooking);
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

      // Poll every 15 seconds for updates (only if not completed/canceled)
      const interval = setInterval(() => {
        if (booking?.status === 'Pending') {
          fetchBooking();
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [id, booking?.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  const isExpired = booking.status === 'Completed' || booking.status === 'Canceled';
  const peopleAhead = booking.queuePosition - 1;

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
          <option value="ES">Espanol</option>
          <option value="FR">Francais</option>
          <option value="PT">Portugues</option>
        </select>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isExpired
              ? booking.status === 'Completed'
                ? 'bg-green-500'
                : 'bg-red-500'
              : 'bg-pink-500'
          }`}>
            {isExpired ? (
              booking.status === 'Completed' ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isExpired ? (
              booking.status === 'Completed' ? t('thankYou') : t('canceled')
            ) : (
              <>{t('hello')}, {booking.clientName}!</>
            )}
          </h1>
          <p className="text-pink-600 font-medium mt-1">{booking.businessName}</p>

          {/* Live Status Badge */}
          {!isExpired && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-green-600 font-medium">{t('liveStatus')}</span>
            </div>
          )}
        </div>

        {/* Completed/Canceled Notice */}
        {isExpired && (
          <div className={`rounded-xl p-4 mb-6 text-center ${
            booking.status === 'Completed'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={booking.status === 'Completed' ? 'text-green-700' : 'text-red-700'}>
              {booking.status === 'Completed' ? t('expired') : t('canceledMessage')}
            </p>
          </div>
        )}

        {/* Time Changed Notification */}
        {timeChanged && !isExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-800">{t('timeUpdated')}</p>
                <p className="text-sm text-amber-700">{t('appointmentMoved')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Queue Position Card - Only show if not expired */}
        {!isExpired && booking.queuePosition > 0 && (
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <div className="text-center">
              <p className="text-pink-100 text-sm mb-2">{t('queuePosition')}</p>
              {booking.queuePosition === 1 ? (
                <>
                  <div className="text-5xl font-bold mb-2">1st</div>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-lg font-semibold text-yellow-100">{t('youAreNext')}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-5xl font-bold mb-2">#{booking.queuePosition}</div>
                  <p className="text-pink-100">
                    {peopleAhead} {peopleAhead === 1 ? t('personAhead') : t('peopleAhead')}
                  </p>
                </>
              )}
              <div className="mt-4 pt-4 border-t border-pink-400">
                <p className="text-pink-100 text-sm">
                  {booking.totalQueueToday} {t('appointmentsToday')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Status Banner */}
          <div className={`px-6 py-3 border-b ${getStatusColor(booking.status)}`}>
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                booking.status === 'Pending' ? 'bg-blue-500 animate-pulse' :
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
                <p className={`text-lg font-semibold ${timeChanged && !isExpired ? 'text-amber-600' : 'text-gray-800'}`}>
                  {formatTime(booking.appointmentHour, booking.appointmentMinute)}
                  {timeChanged && !isExpired && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Updated
                    </span>
                  )}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{t('duration')}</p>
                <p className={`text-lg font-semibold ${booking.durationHours === 0 && booking.durationMinutes === 0 ? 'text-amber-600' : 'text-gray-800'}`}>
                  {booking.durationHours === 0 && booking.durationMinutes === 0
                    ? t('durationPending')
                    : formatDuration(booking.durationHours, booking.durationMinutes)}
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
        {!isExpired && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-gray-600">
                {t('autoRefresh')}
              </p>
            </div>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-2">
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
