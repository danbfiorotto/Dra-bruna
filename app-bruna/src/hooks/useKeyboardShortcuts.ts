import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in an input, textarea, or contenteditable
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
      const altMatch = !!shortcut.altKey === event.altKey;

      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: shortcuts.map(s => ({
      key: s.key,
      ctrlKey: s.ctrlKey,
      shiftKey: s.shiftKey,
      altKey: s.altKey,
      description: s.description
    }))
  };
}

// Hook específico para atalhos da aplicação
export function useAppKeyboardShortcuts({
  onNewAppointment,
  onSearchPatient,
  onGlobalSearch,
  onPrintAgenda,
  onSave,
  onCancel,
  onNext,
  onPrevious,
  enabled = true
}: {
  onNewAppointment?: () => void;
  onSearchPatient?: () => void;
  onGlobalSearch?: () => void;
  onPrintAgenda?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    // N - Nova consulta
    ...(onNewAppointment ? [{
      key: 'n',
      action: onNewAppointment,
      description: 'Nova consulta'
    }] : []),
    
    // F - Buscar paciente
    ...(onSearchPatient ? [{
      key: 'f',
      action: onSearchPatient,
      description: 'Buscar paciente'
    }] : []),
    
    // Ctrl+K - Pesquisa global
    ...(onGlobalSearch ? [{
      key: 'k',
      ctrlKey: true,
      action: onGlobalSearch,
      description: 'Pesquisa global'
    }] : []),
    
    // Ctrl+P - Imprimir agenda
    ...(onPrintAgenda ? [{
      key: 'p',
      ctrlKey: true,
      action: onPrintAgenda,
      description: 'Imprimir agenda'
    }] : []),
    
    // Ctrl+S - Salvar
    ...(onSave ? [{
      key: 's',
      ctrlKey: true,
      action: onSave,
      description: 'Salvar'
    }] : []),
    
    // Escape - Cancelar
    ...(onCancel ? [{
      key: 'Escape',
      action: onCancel,
      description: 'Cancelar'
    }] : []),
    
    // Enter - Próximo/Confirmar
    ...(onNext ? [{
      key: 'Enter',
      action: onNext,
      description: 'Próximo/Confirmar'
    }] : []),
    
    // Arrow Right - Próximo
    ...(onNext ? [{
      key: 'ArrowRight',
      action: onNext,
      description: 'Próximo'
    }] : []),
    
    // Arrow Left - Anterior
    ...(onPrevious ? [{
      key: 'ArrowLeft',
      action: onPrevious,
      description: 'Anterior'
    }] : [])
  ];

  return useKeyboardShortcuts({ shortcuts, enabled });
}

// Hook para mostrar atalhos disponíveis
export function useKeyboardShortcutsHelp() {
  const shortcuts = [
    { key: 'N', description: 'Nova consulta' },
    { key: 'F', description: 'Buscar paciente' },
    { key: 'Ctrl+K', description: 'Pesquisa global' },
    { key: 'Ctrl+P', description: 'Imprimir agenda' },
    { key: 'Ctrl+S', description: 'Salvar' },
    { key: 'Esc', description: 'Cancelar' },
    { key: 'Enter', description: 'Próximo/Confirmar' },
    { key: '←', description: 'Anterior' },
    { key: '→', description: 'Próximo' }
  ];

  return shortcuts;
}

