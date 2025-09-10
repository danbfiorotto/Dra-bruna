import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Save, Check, Clock } from 'lucide-react';
import { MedicalRecord } from '../types/medicalRecord';
import { Patient } from '../types/patient';
import { Appointment } from '../types/appointment';

interface MedicalRecordFormProps {
  medicalRecord?: MedicalRecord;
  patients: Patient[];
  appointments: Appointment[];
  onSave: (data: Partial<MedicalRecord>) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  lastSaved?: Date;
}

type FormStep = 'anamnesis' | 'diagnosis' | 'treatment' | 'notes';

const stepTitles = {
  anamnesis: 'Anamnese',
  diagnosis: 'Diagnóstico',
  treatment: 'Plano de Tratamento',
  notes: 'Observações'
};

const stepDescriptions = {
  anamnesis: 'Histórico do paciente e queixas principais',
  diagnosis: 'Diagnóstico clínico e exames complementares',
  treatment: 'Plano terapêutico e orientações',
  notes: 'Observações adicionais e acompanhamento'
};

export function MedicalRecordForm({
  medicalRecord,
  patients,
  appointments,
  onSave,
  onCancel,
  isSaving = false,
  lastSaved
}: MedicalRecordFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('anamnesis');
  const [formData, setFormData] = useState<Partial<MedicalRecord>>({
    patient_id: medicalRecord?.patient_id || '',
    appointment_id: medicalRecord?.appointment_id || '',
    anamnesis: medicalRecord?.anamnesis || '',
    diagnosis: medicalRecord?.diagnosis || '',
    treatment_plan: medicalRecord?.treatment_plan || '',
    notes: medicalRecord?.notes || '',
    version: medicalRecord?.version || 1
  });

  const [stepCompleted, setStepCompleted] = useState<Record<FormStep, boolean>>({
    anamnesis: false,
    diagnosis: false,
    treatment: false,
    notes: false
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(lastSaved || null);

  const steps: FormStep[] = ['anamnesis', 'diagnosis', 'treatment', 'notes'];
  const currentStepIndex = steps.indexOf(currentStep);

  // Auto-save effect
  useEffect(() => {
    const autoSaveTimer = setTimeout(async () => {
      if (formData.patient_id && (formData.anamnesis || formData.diagnosis || formData.treatment_plan)) {
        try {
          setAutoSaveStatus('saving');
          await onSave(formData);
          setAutoSaveStatus('saved');
          setLastAutoSave(new Date());
        } catch (error) {
          setAutoSaveStatus('error');
          console.error('Erro no auto-save:', error);
        }
      }
    }, 2000); // Auto-save após 2 segundos de inatividade

    return () => clearTimeout(autoSaveTimer);
  }, [formData, onSave]);

  // Verificar se o step está completo
  const checkStepCompletion = (step: FormStep): boolean => {
    switch (step) {
      case 'anamnesis':
        return !!(formData.patient_id && formData.anamnesis?.trim());
      case 'diagnosis':
        return !!(formData.diagnosis?.trim());
      case 'treatment':
        return !!(formData.treatment_plan?.trim());
      case 'notes':
        return true; // Notes é opcional
      default:
        return false;
    }
  };

  // Atualizar status de conclusão dos steps
  useEffect(() => {
    const newStepCompleted = { ...stepCompleted };
    steps.forEach(step => {
      newStepCompleted[step] = checkStepCompletion(step);
    });
    setStepCompleted(newStepCompleted);
  }, [formData]);

  const handleInputChange = (field: keyof MedicalRecord, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleStepClick = (step: FormStep) => {
    setCurrentStep(step);
  };

  const handleSave = async () => {
    try {
      setAutoSaveStatus('saving');
      await onSave(formData);
      setAutoSaveStatus('saved');
      setLastAutoSave(new Date());
    } catch (error) {
      setAutoSaveStatus('error');
      throw error;
    }
  };

  const getStepIcon = (step: FormStep, index: number) => {
    if (stepCompleted[step]) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (index === currentStepIndex) {
      return <div className="w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
        {index + 1}
      </div>;
    }
    return <div className="w-4 h-4 rounded-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center font-bold">
      {index + 1}
    </div>;
  };

  const getAutoSaveStatus = () => {
    if (autoSaveStatus === 'saving') {
      return (
        <div className="flex items-center text-blue-600 text-sm">
          <Clock className="h-4 w-4 mr-1 animate-spin" />
          Salvando...
        </div>
      );
    }
    if (autoSaveStatus === 'saved' && lastAutoSave) {
      const secondsAgo = Math.floor((Date.now() - lastAutoSave.getTime()) / 1000);
      return (
        <div className="flex items-center text-green-600 text-sm">
          <Check className="h-4 w-4 mr-1" />
          Salvo há {secondsAgo}s
        </div>
      );
    }
    if (autoSaveStatus === 'error') {
      return (
        <div className="flex items-center text-red-600 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          Erro ao salvar
        </div>
      );
    }
    return null;
  };

  const renderAnamnesisStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="patient_id">Paciente *</Label>
        <Select
          value={formData.patient_id || ''}
          onValueChange={(value) => handleInputChange('patient_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um paciente" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name} - {patient.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="appointment_id">Consulta (opcional)</Label>
        <Select
          value={formData.appointment_id || ''}
          onValueChange={(value) => handleInputChange('appointment_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma consulta" />
          </SelectTrigger>
          <SelectContent>
            {appointments
              .filter(apt => apt.patient_id === formData.patient_id)
              .map((appointment) => (
                <SelectItem key={appointment.id} value={appointment.id}>
                  {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} - {appointment.start_time}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="anamnesis">Anamnese *</Label>
        <Textarea
          id="anamnesis"
          value={formData.anamnesis || ''}
          onChange={(e) => handleInputChange('anamnesis', e.target.value)}
          placeholder="Descreva a história clínica do paciente, queixas principais, sintomas, antecedentes pessoais e familiares..."
          className="min-h-[200px]"
        />
        <p className="text-sm text-gray-500 mt-1">
          Inclua: queixa principal, história da doença atual, antecedentes pessoais e familiares, medicações em uso, alergias
        </p>
      </div>
    </div>
  );

  const renderDiagnosisStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="diagnosis">Diagnóstico *</Label>
        <Textarea
          id="diagnosis"
          value={formData.diagnosis || ''}
          onChange={(e) => handleInputChange('diagnosis', e.target.value)}
          placeholder="Descreva o diagnóstico clínico, exames complementares realizados, hipóteses diagnósticas..."
          className="min-h-[200px]"
        />
        <p className="text-sm text-gray-500 mt-1">
          Inclua: diagnóstico principal, diagnósticos diferenciais, exames complementares, achados clínicos
        </p>
      </div>
    </div>
  );

  const renderTreatmentStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="treatment_plan">Plano de Tratamento *</Label>
        <Textarea
          id="treatment_plan"
          value={formData.treatment_plan || ''}
          onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
          placeholder="Descreva o plano terapêutico, medicações prescritas, orientações, retorno..."
          className="min-h-[200px]"
        />
        <p className="text-sm text-gray-500 mt-1">
          Inclua: medicações prescritas, dosagens, orientações gerais, data de retorno, cuidados especiais
        </p>
      </div>
    </div>
  );

  const renderNotesStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="notes">Observações Adicionais</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Observações complementares, orientações especiais, acompanhamento..."
          className="min-h-[150px]"
        />
        <p className="text-sm text-gray-500 mt-1">
          Campo opcional para observações adicionais e acompanhamento
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'anamnesis':
        return renderAnamnesisStep();
      case 'diagnosis':
        return renderDiagnosisStep();
      case 'treatment':
        return renderTreatmentStep();
      case 'notes':
        return renderNotesStep();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header com progresso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {medicalRecord ? 'Editar Prontuário' : 'Novo Prontuário'}
            </h2>
            <p className="text-gray-600">
              {stepDescriptions[currentStep]}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {getAutoSaveStatus()}
            <Button
              onClick={handleSave}
              disabled={isSaving || autoSaveStatus === 'saving'}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <button
                onClick={() => handleStepClick(step)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === step
                    ? 'bg-primary text-white'
                    : stepCompleted[step]
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {getStepIcon(step, index)}
                <span className="font-medium">{stepTitles[step]}</span>
              </button>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{stepTitles[currentStep]}</span>
            <Badge variant={stepCompleted[currentStep] ? 'default' : 'outline'}>
              {stepCompleted[currentStep] ? 'Completo' : 'Em andamento'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          {currentStepIndex < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!stepCompleted[currentStep]}
              className="bg-primary hover:bg-primary/90"
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isSaving || autoSaveStatus === 'saving'}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
