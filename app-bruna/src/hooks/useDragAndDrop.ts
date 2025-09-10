import { useState, useCallback, useRef } from 'react';

interface DragState {
  isDragging: boolean;
  draggedItem: any | null;
  dragOverItem: any | null;
}

interface UseDragAndDropOptions {
  onDrop: (draggedItem: any, targetItem: any) => void;
  onDragStart?: (item: any) => void;
  onDragEnd?: () => void;
}

export function useDragAndDrop({ onDrop, onDragStart, onDragEnd }: UseDragAndDropOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragOverItem: null
  });

  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: any) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedItem: item
    }));

    onDragStart?.(item);
  }, [onDragStart]);

  const handleDragOver = useCallback((e: React.DragEvent, item: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDragState(prev => ({
      ...prev,
      dragOverItem: item
    }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Só limpa se sair do elemento completamente
    if (!dragRef.current?.contains(e.relatedTarget as Node)) {
      setDragState(prev => ({
        ...prev,
        dragOverItem: null
      }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetItem: any) => {
    e.preventDefault();
    
    try {
      const draggedItem = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (draggedItem && targetItem && draggedItem.id !== targetItem.id) {
        onDrop(draggedItem, targetItem);
      }
    } catch (error) {
      console.error('Erro ao processar drop:', error);
    }

    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOverItem: null
    });

    onDragEnd?.();
  }, [onDrop, onDragEnd]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOverItem: null
    });

    onDragEnd?.();
  }, [onDragEnd]);

  return {
    dragState,
    dragRef,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  };
}

// Hook específico para drag and drop de consultas
export function useAppointmentDragAndDrop(onReschedule: (appointmentId: string, newDate: string, newTime: string) => void) {
  const { dragState, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd } = useDragAndDrop({
    onDrop: (draggedAppointment, targetDate) => {
      if (targetDate && draggedAppointment) {
        // Extrair data e hora do target
        const newDate = targetDate.toISOString().split('T')[0];
        const newTime = draggedAppointment.start_time; // Manter o horário original por enquanto
        
        onReschedule(draggedAppointment.id, newDate, newTime);
      }
    }
  });

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  };
}

