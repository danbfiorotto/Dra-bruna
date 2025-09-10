import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Save, Check, Clock } from 'lucide-react';
import { MedicalRecord } from '../types/medicalRecord';
import { Patient } from '../types/patient';
import { Appointment } from '../types/appointment';
import { StructuredAnamnesis } from './StructuredAnamnesis';
import { AnamnesisService } from '../services/supabase/anamnesis';

interface MedicalRecordFormProps {
  medicalRecord?: MedicalRecord;
  patients: Patient[];
  appointments: Appointment[];
  onSave: (data: Partial<MedicalRecord>) => Promise<MedicalRecord>;
  onCancel: () => void;
  isSaving?: boolean;
}

type FormStep = 'patient_data' | 'structured_anamnesis' | 'treatment' | 'notes';

const stepTitles = {
  patient_data: 'Dados do Paciente',
  structured_anamnesis: 'Anamnese',
  treatment: 'Diagnóstico/Tratamento',
  notes: 'Observações'
};

const stepDescriptions = {
  patient_data: 'Informações pessoais e de contato do paciente',
  structured_anamnesis: 'Perguntas estruturadas e histórico livre do paciente',
  treatment: 'Diagnóstico clínico e plano terapêutico',
  notes: 'Observações adicionais e acompanhamento'
};

export function MedicalRecordForm({
  medicalRecord,
  patients,
  appointments,
  onSave,
  onCancel,
  isSaving = false
}: MedicalRecordFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('patient_data');
  const [formData, setFormData] = useState<Partial<MedicalRecord>>({
    patient_id: medicalRecord?.patient_id || '',
    appointment_id: medicalRecord?.appointment_id || undefined,
    anamnesis: medicalRecord?.anamnesis || '',
    diagnosis: medicalRecord?.diagnosis || '',
    treatment_plan: medicalRecord?.treatment_plan || '',
    notes: medicalRecord?.notes || '',
    rg: medicalRecord?.rg || '',
    cpf: medicalRecord?.cpf || '',
    indication: medicalRecord?.indication || '',
    main_complaint: medicalRecord?.main_complaint || '',
    version: medicalRecord?.version || 1
  });

  const [stepCompleted, setStepCompleted] = useState<Record<FormStep, boolean>>({
    patient_data: false,
    structured_anamnesis: false,
    treatment: false,
    notes: false
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [tempAnamnesisResponses, setTempAnamnesisResponses] = useState<any[]>([]);
  const [medicalRecordId, setMedicalRecordId] = useState<string | null>(medicalRecord?.id || null);
  const [tempMedicalRecordId, setTempMedicalRecordId] = useState<string | null>(null);

  const steps: FormStep[] = ['patient_data', 'structured_anamnesis', 'treatment', 'notes'];
  const currentStepIndex = steps.indexOf(currentStep);

  // Auto-save effect
  // Auto-save desabilitado - salvamento apenas no final
  // useEffect(() => {
  //   const autoSaveTimer = setTimeout(async () => {
  //     if (formData.patient_id && (formData.anamnesis || formData.diagnosis || formData.treatment_plan)) {
  //       try {
  //         setAutoSaveStatus('saving');
  //         await onSave(formData);
  //         setAutoSaveStatus('saved');
  //         setLastAutoSave(new Date());
  //       } catch (error) {
  //         setAutoSaveStatus('error');
  //         console.error('Erro no auto-save:', error);
  //       }
  //     }
  //   }, 2000); // Auto-save após 2 segundos de inatividade

  //   return () => clearTimeout(autoSaveTimer);
  // }, [formData, onSave]);

  // Verificar se o step está completo
  const checkStepCompletion = (step: FormStep): boolean => {
    switch (step) {
      case 'patient_data':
        return !!(formData.patient_id && formData.main_complaint?.trim());
      case 'structured_anamnesis':
        return stepCompleted.structured_anamnesis; // Usar validação do componente
      case 'treatment':
        return !!(formData.diagnosis?.trim() && formData.treatment_plan?.trim());
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
      // Apenas mudar de etapa, sem salvar
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
      console.log('🔄 Iniciando salvamento do prontuário...');
      console.log('📊 Dados do formulário:', formData);
      console.log('📝 Respostas temporárias da anamnese:', tempAnamnesisResponses);
      console.log('🆔 Medical Record ID atual:', medicalRecordId);
      
      setAutoSaveStatus('saving');
      const savedRecord = await onSave(formData);
      console.log('✅ Prontuário salvo:', savedRecord);
      setAutoSaveStatus('saved');
      
      // Se é um novo prontuário, atualizar o ID para permitir anamnese
      if (!medicalRecordId && savedRecord && 'id' in savedRecord) {
        const newId = savedRecord.id as string;
        console.log('🆔 Novo ID do prontuário:', newId);
        setMedicalRecordId(newId);
        
        // Se há respostas temporárias da anamnese, salvá-las agora
        if (tempAnamnesisResponses.length > 0) {
          try {
            console.log('💾 Salvando respostas temporárias da anamnese...');
            // Atualizar o medical_record_id das respostas temporárias
            const responsesWithRealId = tempAnamnesisResponses.map(response => ({
              ...response,
              medical_record_id: newId
            }));
            
            console.log('📋 Respostas com ID real:', responsesWithRealId);
            
            const savedResponses = await AnamnesisService.saveAnamnesisResponses(newId, responsesWithRealId);
            console.log('✅ Anamnese salva com sucesso:', savedResponses);
            
            // Limpar as respostas temporárias
            setTempAnamnesisResponses([]);
            setTempMedicalRecordId(null);
          } catch (error) {
            console.error('❌ Erro ao salvar anamnese temporária:', error);
          }
        } else {
          console.log('ℹ️ Nenhuma resposta temporária para salvar');
        }
      } else {
        console.log('ℹ️ Não é um novo prontuário ou não há ID válido');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar prontuário:', error);
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


  const renderPatientDataStep = () => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rg">RG</Label>
          <Input
            id="rg"
            value={formData.rg || ''}
            onChange={(e) => handleInputChange('rg', e.target.value)}
            placeholder="Número do RG"
          />
        </div>
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf || ''}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            placeholder="Número do CPF"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="indication">Indicação</Label>
        <Input
          id="indication"
          value={formData.indication || ''}
          onChange={(e) => handleInputChange('indication', e.target.value)}
          placeholder="Quem indicou o paciente"
        />
      </div>

      <div>
        <Label htmlFor="main_complaint">Queixa Principal *</Label>
        <Textarea
          id="main_complaint"
          value={formData.main_complaint || ''}
          onChange={(e) => handleInputChange('main_complaint', e.target.value)}
          placeholder="Descreva a queixa principal do paciente..."
          className="min-h-[100px]"
        />
      </div>

    </div>
  );

  // Callbacks estáveis para evitar re-renders infinitos
  const handleAnamnesisResponsesChange = useCallback((responses: any[]) => {
    console.log('📝 Anamnese estruturada atualizada:', responses);
    console.log('📊 Número de respostas:', responses.length);
    console.log('📋 Tipo das respostas:', typeof responses);
    setTempAnamnesisResponses(responses);
  }, []);

  const handleAnamnesisValidationChange = useCallback((isValid: boolean) => {
    setStepCompleted(prev => ({ ...prev, structured_anamnesis: isValid }));
  }, []);

  const handleFreeAnamnesisChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, anamnesis: text }));
  }, []);

  const renderStructuredAnamnesisStep = () => {
    // Gerar ID temporário se necessário
    const anamnesisId = medicalRecordId || tempMedicalRecordId || (() => {
      if (!tempMedicalRecordId) {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setTempMedicalRecordId(tempId);
        return tempId;
      }
      return tempMedicalRecordId;
    })();

    return (
      <div className="space-y-6">
        <StructuredAnamnesis
          medicalRecordId={anamnesisId}
          onResponsesChange={handleAnamnesisResponsesChange}
          onValidationChange={handleAnamnesisValidationChange}
          onFreeAnamnesisChange={handleFreeAnamnesisChange}
          freeAnamnesisValue={formData.anamnesis || ''}
        />
        {!medicalRecordId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Anamnese temporária</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Suas respostas serão salvas quando você salvar o prontuário.
            </p>
          </div>
        )}
      </div>
    );
  };



  const renderTreatmentStep = () => (
    <div className="space-y-6">
      {/* Diagnóstico */}
      <div>
        <Label htmlFor="diagnosis">Diagnóstico *</Label>
        <Textarea
          id="diagnosis"
          value={formData.diagnosis || ''}
          onChange={(e) => handleInputChange('diagnosis', e.target.value)}
          placeholder="Descreva o diagnóstico clínico, exames complementares realizados, achados..."
          className="min-h-[120px]"
        />
        <p className="text-sm text-gray-500 mt-1">
          Inclua: diagnóstico principal, diagnósticos diferenciais, exames complementares, achados clínicos
        </p>
      </div>

      {/* Plano de Tratamento */}
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
      case 'patient_data':
        return renderPatientDataStep();
      case 'structured_anamnesis':
        return renderStructuredAnamnesisStep();
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
            <div className="text-sm text-gray-600">
              Salve o prontuário ao finalizar todas as etapas
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-shrink-0">
              <button
                onClick={() => handleStepClick(step)}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-colors text-xs sm:text-sm ${
                  currentStep === step
                    ? 'bg-primary text-white'
                    : stepCompleted[step]
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {getStepIcon(step, index)}
                <span className="font-medium hidden sm:inline">{stepTitles[step]}</span>
                <span className="font-medium sm:hidden">
                  {step === 'patient_data' ? 'Paciente' :
                   step === 'structured_anamnesis' ? 'Anamnese' :
                   step === 'treatment' ? 'Diag/Trat' :
                   step === 'notes' ? 'Notas' : step}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className="w-2 h-px bg-gray-300 mx-1" />
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
              disabled={isSaving || autoSaveStatus === 'saving' || !stepCompleted[currentStep]}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Prontuário
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
