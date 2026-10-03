import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  CreditCard,
  X,
  Sparkles
} from 'lucide-react';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { Subscription } from '../types';
import { BrandIcon } from '../components/common/BrandIcon';

interface CalendarPageProps {
  onNavigate: (path: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onNavigate }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [budgetConfig, setBudgetConfig] = useState(DataService.getBudgetConfig());
  // Current month reference: October 2026 (matching the hackathon timeline & demo dates)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October
  const [selectedDay, setSelectedDay] = useState<number | null>(12); // Default selected Oct 12 (Spotify)

  const loadData = () => {
    setSubscriptions(DataService.getSubscriptions());
    setBudgetConfig(DataService.getBudgetConfig());
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  // Find subscriptions due on each day of currentMonth
  const subsByDay = new Map<number, Subscription[]>();
  let monthTotal = 0;
  let upcomingTotal = 0;
  const today = new Date('2026-10-02');

  for (const sub of activeSubs) {
    if (!sub.next_billing_date) continue;
    const d = new Date(sub.next_billing_date);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const dayNum = d.getDate();
      if (!subsByDay.has(dayNum)) {
        subsByDay.set(dayNum, []);
      }
      subsByDay.get(dayNum)!.push(sub);
      monthTotal += Number(sub.amount);

      if (d >= today) {
        upcomingTotal += Number(sub.amount);
      }
    }
  }

  const selectedSubs = selectedDay ? subsByDay.get(selectedDay) || [] : [];
  const selectedDayTotal = selectedSubs.reduce((acc, s) => acc + Number(s.amount), 0);

  return (
    <div className="space-y-6">
      {/* Top Header (Velocity Editorial Styling) */}
      <div className="bg-[#FBF9F3] p-6 rounded-[12px] border border-[#D8D5CA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#092326] tracking-tight">
              Renewal Calendar
            </h1>
            <span className="text-[10px] font-bold text-[#092326] bg-[#E4EBD8] px-2 py-0.5 rounded-[4px] border border-[#D8D5CA] uppercase tracking-wider font-mono">
              Auto-Debits
            </span>
            {monthTotal > budgetConfig.monthly_budget ? (
              <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-[4px] border border-rose-300 font-mono">
                Over Budget (+₹{(monthTotal - budgetConfig.monthly_budget).toLocaleString('en-IN')})
              </span>
            ) : (
              <span className="text-[10px] font-bold text-[#526064] bg-[#F2F0E7] px-2 py-0.5 rounded-[4px] border border-[#D8D5CA] font-mono">
                Budget: {Math.round((monthTotal / budgetConfig.monthly_budget) * 100)}% Used
              </span>
            )}
          </div>
          <p className="text-xs text-[#526064] mt-1 font-sans">
            Forecasting upcoming auto-debits with recognized app logos and shifted-billing dates.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-1 bg-[#F2F0E7] p-1 rounded-[8px] border border-[#D8D5CA]">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-[6px] hover:bg-white text-[#526064] hover:text-[#092326] transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif font-bold text-sm text-[#092326] px-3 min-w-[130px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-[6px] hover:bg-white text-[#526064] hover:text-[#092326] transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#FBF9F3] p-4 rounded-[12px] border border-[#D8D5CA] shadow-xs">
          <span className="text-[10px] font-bold text-[#526064] uppercase tracking-wider font-mono">Month Total Outflow</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold text-[#092326] tabular-nums">
              ₹{monthTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] text-[#526064] mt-1">Total recurring commitments</p>
        </div>

        <div className="bg-[#FBF9F3] p-4 rounded-[12px] border border-[#D8D5CA] shadow-xs">
          <span className="text-[10px] font-bold text-[#526064] uppercase tracking-wider font-mono">Upcoming Remainder</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold text-[#092326] tabular-nums">
              ₹{upcomingTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] text-[#526064] mt-1">Remaining debits after today</p>
        </div>

        <div className="bg-[#FBF9F3] p-4 rounded-[12px] border border-[#D8D5CA] shadow-xs">
          <span className="text-[10px] font-bold text-[#526064] uppercase tracking-wider font-mono">Scheduled Days</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold text-[#092326] tabular-nums">{subsByDay.size}</span>
            <span className="text-[10px] text-[#526064]">active billing days</span>
          </div>
        </div>

        <div className="bg-[#FBF9F3] p-4 rounded-[12px] border border-[#D8D5CA] shadow-xs">
          <span className="text-[10px] font-bold text-[#526064] uppercase tracking-wider font-mono">Shifted Date Shield</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold text-[#092326] tabular-nums">±2 days</span>
          </div>
          <p className="text-[10px] text-[#526064] mt-1">Adaptive renewal prediction</p>
        </div>
      </div>

      {/* Main Grid: Calendar & Day Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 bg-[#FBF9F3] p-5 rounded-[12px] border border-[#D8D5CA] shadow-xs space-y-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#526064] pb-2 border-b border-[#D8D5CA] font-mono">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for month start offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 md:h-24 bg-[#F2F0E7]/40 rounded-[8px]" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasSubs = subsByDay.has(day);
              const daySubs = subsByDay.get(day) || [];
              const isSelected = selectedDay === day;
              const isToday = currentYear === 2026 && currentMonth === 9 && day === 2;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 md:h-24 p-1.5 rounded-[8px] border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#092326] ring-1 ring-[#092326] bg-[#E4EBD8]/40 shadow-xs'
                      : hasSubs
                      ? 'border-[#D8D5CA] hover:border-[#092326] bg-[#FBF9F3] hover:bg-[#F2F0E7]'
                      : 'border-transparent hover:bg-[#F2F0E7] text-[#526064]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-serif font-bold tabular-nums w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-[#092326] text-[#FBF9F3]'
                          : isSelected
                          ? 'text-[#092326] font-bold'
                          : 'text-[#092326]'
                      }`}
                    >
                      {day}
                    </span>
                    {hasSubs && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#092326] shrink-0" />
                    )}
                  </div>

                  {/* APP LOGOS PREVIEW IN CALENDAR DAY CELL (SMOOTH & CRISP) */}
                  {hasSubs && (
                    <div className="space-y-1 mt-auto">
                      <div className="flex items-center gap-1.5 overflow-hidden flex-wrap">
                        {daySubs.map((s) => (
                          <div
                            key={s.id}
                            title={`${s.merchant_name} — ₹${s.amount}`}
                            className="shrink-0 w-6 h-6 rounded-[5px] overflow-hidden flex items-center justify-center border border-[#D8D5CA]/80 shadow-2xs hover:scale-115 transition-transform cursor-pointer"
                          >
                            <BrandIcon name={s.merchant_name} size="xs" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] font-bold text-[#092326] tabular-nums block font-mono">
                        ₹{daySubs.reduce((sum, s) => sum + s.amount, 0)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail Drawer / Panel (Right Column) */}
        <div className="bg-[#FBF9F3] p-5 rounded-[12px] border border-[#D8D5CA] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D5CA]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#092326]">
                  {selectedDay ? `${selectedDay} ${monthNames[currentMonth]} ${currentYear}` : 'Select a Day'}
                </h2>
                <p className="text-xs text-[#526064]">
                  {selectedSubs.length} renewals scheduled · ₹{selectedDayTotal.toLocaleString('en-IN')} total
                </p>
              </div>
              {selectedDay && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-1 text-[#526064] hover:text-[#092326]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {selectedSubs.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#526064] space-y-2">
                <Clock className="w-8 h-8 mx-auto text-[#D8D5CA]" />
                <p className="font-medium text-[#092326]">No renewals scheduled for this date.</p>
                <p className="text-[11px] text-[#526064]">Click on any date marked with an app icon.</p>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {selectedSubs.map((sub) => {
                  const dueDate = new Date(sub.next_billing_date);
                  const diffDays = Math.ceil(
                    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const daysLabel =
                    diffDays < 0 ? `${Math.abs(diffDays)}d overdue` : diffDays === 0 ? 'Due Today' : `Renews in ${diffDays} days`;

                  return (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-[8px] border border-[#D8D5CA] bg-[#F2F0E7]/60 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {/* Prominent High-Res App Logo */}
                          <BrandIcon name={sub.merchant_name} size="md" />
                          <div>
                            <h3 className="text-xs font-bold text-[#092326]">{sub.merchant_name}</h3>
                            <p className="text-[11px] text-[#526064]">{sub.category}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-serif font-bold text-[#092326] tabular-nums">
                            ₹{sub.amount.toLocaleString('en-IN')}
                          </span>
                          <p className="text-[10px] text-[#526064]">/{sub.cycle}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#D8D5CA]/70 text-[11px]">
                        <span className="text-[#092326] font-semibold">{daysLabel}</span>
                        <span className="text-[#526064] font-mono text-[10px]">{sub.payment_method}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 bg-[#E4EBD8] border border-[#D8D5CA] rounded-[8px] text-xs text-[#092326]">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Shifted Date Intelligence:</span>
            </span>
            <p className="text-[11px] text-[#526064] mt-0.5">
              Velocity predicts debit dates despite weekend gateway processing variations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
