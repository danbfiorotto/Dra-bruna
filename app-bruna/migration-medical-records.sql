-- Migration: Expand Medical Records System
-- This migration adds structured anamnesis, procedures, and budget tracking

-- 1. Expand patients table with additional fields
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS rg TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS indication TEXT; -- Who referred the patient

-- 2. Create anamnesis questions table
CREATE TABLE IF NOT EXISTS public.anamnesis_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'boolean', -- 'boolean', 'text', 'date'
    is_required BOOLEAN DEFAULT false,
    category TEXT NOT NULL, -- 'general', 'medical_history', 'medications', 'allergies', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(question_number, user_id)
);

-- 3. Create anamnesis responses table
CREATE TABLE IF NOT EXISTS public.anamnesis_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.anamnesis_questions(id) ON DELETE CASCADE NOT NULL,
    boolean_response BOOLEAN,
    text_response TEXT,
    date_response DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(medical_record_id, question_id)
);

-- 4. Create procedures table
CREATE TABLE IF NOT EXISTS public.procedures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'consultation', 'treatment', 'examination', 'surgery'
    default_duration INTEGER, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 5. Create procedure_executions table (procedures performed in appointments)
CREATE TABLE IF NOT EXISTS public.procedure_executions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
    procedure_id UUID REFERENCES public.procedures(id) ON DELETE CASCADE NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 6. Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE NOT NULL,
    total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'rejected'
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 7. Create budget_items table
CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
    procedure_id UUID REFERENCES public.procedures(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_value DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Expand medical_records table
ALTER TABLE public.medical_records 
ADD COLUMN IF NOT EXISTS rg TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS indication TEXT,
ADD COLUMN IF NOT EXISTS main_complaint TEXT, -- Queixa principal
ADD COLUMN IF NOT EXISTS last_dental_consultation DATE; -- Última consulta odontológica

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_rg ON public.patients(rg);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON public.patients(cpf);
CREATE INDEX IF NOT EXISTS idx_anamnesis_questions_user_id ON public.anamnesis_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_questions_category ON public.anamnesis_questions(category);
CREATE INDEX IF NOT EXISTS idx_anamnesis_responses_medical_record_id ON public.anamnesis_responses(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_responses_question_id ON public.anamnesis_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_procedures_user_id ON public.procedures(user_id);
CREATE INDEX IF NOT EXISTS idx_procedures_category ON public.procedures(category);
CREATE INDEX IF NOT EXISTS idx_procedure_executions_appointment_id ON public.procedure_executions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_procedure_executions_procedure_id ON public.procedure_executions(procedure_id);
CREATE INDEX IF NOT EXISTS idx_budgets_medical_record_id ON public.budgets(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON public.budget_items(budget_id);

-- Enable RLS on new tables
ALTER TABLE public.anamnesis_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnesis_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anamnesis_questions
CREATE POLICY "Users can manage own anamnesis questions" ON public.anamnesis_questions
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for anamnesis_responses
CREATE POLICY "Users can manage anamnesis responses" ON public.anamnesis_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.medical_records 
            WHERE id = medical_record_id 
            AND created_by = auth.uid()
        )
    );

-- RLS Policies for procedures
CREATE POLICY "Users can manage own procedures" ON public.procedures
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for procedure_executions
CREATE POLICY "Users can manage procedure executions" ON public.procedure_executions
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for budgets
CREATE POLICY "Users can manage budgets" ON public.budgets
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for budget_items
CREATE POLICY "Users can manage budget items" ON public.budget_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.budgets 
            WHERE id = budget_id 
            AND user_id = auth.uid()
        )
    );

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_anamnesis_questions_updated_at BEFORE UPDATE ON public.anamnesis_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anamnesis_responses_updated_at BEFORE UPDATE ON public.anamnesis_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON public.procedures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedure_executions_updated_at BEFORE UPDATE ON public.procedure_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON public.budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default anamnesis questions based on Dra. Bruna's form
INSERT INTO public.anamnesis_questions (question_number, question_text, question_type, is_required, category, user_id) VALUES
(1, 'Está em tratamento médico?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(2, 'Faz uso de medicação contínua? (Ex: anticoncepcional, ansiolítico)', 'boolean', false, 'medications', (SELECT id FROM auth.users LIMIT 1)),
(3, 'Possui alguma alergia? (Ex: penicilinas, AAS, alimentos ou bebidas)', 'boolean', false, 'allergies', (SELECT id FROM auth.users LIMIT 1)),
(4, 'Possui alguma alteração cardiovascular (coração)?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(5, 'Possui hipertensão/hipotensão (pressão alta/baixa)?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(6, 'Possui diabetes?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(7, 'Possui alguma alteração respiratória (asma, rinite, bronquite)?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(8, 'Alteração no estômago (ex: gastrite, azia, refluxo, úlcera)?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(9, 'Possui epilepsia (convulsões)?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(10, 'Possui histórico de Infarto ou AVC, em menos de 6 meses?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(11, 'Possui alguma doença transmissível (Ex: HIV, hepatite, tuberculose, herpes, etc)?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(12, 'Possui alguma outra doença/síndrome não questionada?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(13, 'Já foi diagnosticado(a) com algum tipo de câncer?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(14, 'Já fez radioterapia ou quimioterapia?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(15, 'Fuma ou já fumou?', 'boolean', false, 'lifestyle', (SELECT id FROM auth.users LIMIT 1)),
(16, 'Ingere bebidas alcoólicas?', 'boolean', false, 'lifestyle', (SELECT id FROM auth.users LIMIT 1)),
(17, 'Faz uso de drogas?', 'boolean', false, 'lifestyle', (SELECT id FROM auth.users LIMIT 1)),
(18, 'Está grávida?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(19, 'Está amamentando?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(20, 'Apresentou ou apresenta sintomas de COVID-19/Gripe nos últimos 7 dias?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(21, 'Já foi diagnosticado com COVID-19?', 'boolean', false, 'medical_history', (SELECT id FROM auth.users LIMIT 1)),
(22, 'Última vez que passou em consulta odontológica?', 'date', false, 'dental_history', (SELECT id FROM auth.users LIMIT 1)),
(23, 'Queixa principal?', 'text', true, 'complaint', (SELECT id FROM auth.users LIMIT 1));

-- Insert default procedures
INSERT INTO public.procedures (name, description, category, default_duration, user_id) VALUES
('Consulta de Avaliação', 'Consulta inicial para avaliação do paciente', 'consultation', 60, (SELECT id FROM auth.users LIMIT 1)),
('Consulta de Retorno', 'Consulta de retorno para acompanhamento', 'consultation', 30, (SELECT id FROM auth.users LIMIT 1)),
('Exame Clínico', 'Exame físico completo', 'examination', 45, (SELECT id FROM auth.users LIMIT 1)),
('Procedimento Cirúrgico', 'Procedimento cirúrgico geral', 'surgery', 120, (SELECT id FROM auth.users LIMIT 1)),
('Aplicação de Medicamento', 'Aplicação de medicamento via injetável', 'treatment', 15, (SELECT id FROM auth.users LIMIT 1));
