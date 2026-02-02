import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Bell, Calendar, Loader2 } from 'lucide-react';

export function EventsSection() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const token = user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await api.get('/api/events', config);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display">Upcoming Events</h2>
          <p className="text-sm text-muted-foreground">Exclusive events for Yashoda Bhavan residents</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="group relative bg-muted/20 rounded-2xl p-4 md:p-6 border border-border/30 hover:bg-muted/30 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6">
                {event.image && (
                  <div className="h-32 md:h-40 w-full md:w-56 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold font-display text-foreground">{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold bg-primary/10 px-3 py-1 rounded-full ring-1 ring-primary/20">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
              <Bell className="w-10 h-10 text-muted-foreground m-auto mb-3 opacity-20" />
              <p className="text-muted-foreground text-sm">No upcoming events scheduled.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
