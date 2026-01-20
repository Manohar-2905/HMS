import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceCalendarProps {
  userId: string;
  token: string;
  className?: string;
}

interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
}

export function AttendanceCalendar({ userId, token, className }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchAttendance();
  }, [currentDate, userId]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await api.get(`/api/attendance/history/${userId}/${month}/${year}`, config);
      setAttendance(data);
    } catch (error) {
      console.error('Error fetching monthly attendance', error);
    } finally {
      setIsLoading(false);
    }
  };

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(month, year);
  const firstDay = firstDayOfMonth(month, year);

  const getStatusForDay = (day: number) => {
    const dateString = new Date(year, month, day).toISOString().split('T')[0];
    const record = attendance.find(r => r.date.startsWith(dateString));

    // If the date is in the future, return null
    if (new Date(year, month, day) > new Date()) return null;

    return record ? record.status : 'Present'; // Default to Present as per requirements
  };

  return (
    <div className={cn("bg-card rounded-3xl border border-border shadow-sm overflow-hidden", className)}>
      <div className="p-6 bg-primary/5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground font-display">
              {monthNames[month]} {year}
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Monthly Attendance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Syncing records...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const status = getStatusForDay(day);
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                return (
                  <div
                    key={day}
                    className={cn(
                      "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group border border-transparent",
                      status === 'Present' && "bg-emerald-50 text-emerald-700 border-emerald-100",
                      status === 'Absent' && "bg-rose-50 text-rose-700 border-rose-100",
                      status === 'Leave' && "bg-amber-50 text-amber-700 border-amber-100",
                      status === null && "bg-muted/30 text-muted-foreground/50",
                      isToday && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    <span className="text-sm font-bold">{day}</span>
                    {status && (
                      <span className={cn(
                        "text-[8px] font-bold uppercase tracking-tighter mt-0.5 opacity-60",
                        status === 'Present' && "text-emerald-600",
                        status === 'Absent' && "text-rose-600",
                        status === 'Leave' && "text-amber-600"
                      )}>
                        {status}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <LegendItem color="bg-emerald-500" label="Present" />
              <LegendItem color="bg-rose-500" label="Absent" />
              <LegendItem color="bg-amber-500" label="Leave" />
              <LegendItem color="bg-muted" label="Future" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
  );
}
