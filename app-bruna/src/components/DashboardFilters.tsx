import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DashboardFiltersProps } from '@/types/dashboard';

export function DashboardFilters({ 
  value, 
  onChange, 
  clinics, 
  isLoading = false 
}: Omit<DashboardFiltersProps, 'onExport'>) {
  const [showCustomDates, setShowCustomDates] = React.useState(false);
  const [customStartDate, setCustomStartDate] = React.useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = React.useState<Date | undefined>();

  // Handle period change
  const handlePeriodChange = (period: string) => {
    if (period === 'custom') {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
      onChange({
        ...value,
        period: period as any,
        customStartDate: undefined,
        customEndDate: undefined
      });
    }
  };

  // Handle custom date change
  const handleCustomDateChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    
    if (startDate && endDate) {
      onChange({
        ...value,
        period: 'custom',
        customStartDate: startDate.toISOString().split('T')[0],
        customEndDate: endDate.toISOString().split('T')[0]
      });
    }
  };

  // Handle clinic selection
  const handleClinicToggle = (clinicId: string, checked: boolean) => {
    if (checked) {
      onChange({
        ...value,
        clinics: [...value.clinics, clinicId]
      });
    } else {
      onChange({
        ...value,
        clinics: value.clinics.filter(id => id !== clinicId)
      });
    }
  };


  // Clear all filters
  const clearFilters = () => {
    onChange({
      period: 'month',
      clinics: []
    });
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    setShowCustomDates(false);
  };

  // Get active filter chips
  const getActiveFilters = () => {
    const chips = [];
    
    // Period chip
    const periodLabels = {
      today: 'Hoje',
      week: 'Esta semana',
      month: 'Este mês',
      last_month: 'Mês passado',
      custom: 'Período personalizado'
    };
    
    if (value.period !== 'month') {
      chips.push({
        label: periodLabels[value.period],
        onRemove: () => onChange({ ...value, period: 'month' })
      });
    }

    // Clinics chips
    value.clinics.forEach(clinicId => {
      const clinic = clinics.find(c => c.id === clinicId);
      if (clinic) {
        chips.push({
          label: clinic.name,
          onRemove: () => handleClinicToggle(clinicId, false)
        });
      }
    });


    return chips;
  };

  const activeFilters = getActiveFilters();

  return (
    <Card className="sticky top-4 z-10 mb-6">
      <CardContent className="p-3">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Period Selection */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={value.period} onValueChange={handlePeriodChange} disabled={isLoading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="last_month">Mês passado</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {/* Custom Date Range */}
            {showCustomDates && (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Início'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={(date) => handleCustomDateChange(date, customEndDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Fim'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={(date) => handleCustomDateChange(customStartDate, date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Clinics Selection */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Select disabled={isLoading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Clínicas" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map(clinic => (
                  <div key={clinic.id} className="flex items-center space-x-2 p-2">
                    <Checkbox
                      id={clinic.id}
                      checked={value.clinics.includes(clinic.id)}
                      onCheckedChange={(checked) => handleClinicToggle(clinic.id, checked as boolean)}
                    />
                    <label
                      htmlFor={clinic.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {clinic.name}
                    </label>
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={isLoading}
              className="px-2 h-6"
            >
              <X className="mr-1 h-3 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Active Filters Chips */}
        {activeFilters.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter.label}
                  <button
                    onClick={filter.onRemove}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
