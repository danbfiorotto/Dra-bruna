/**
 * Serviço de geração de PDF usando APIs nativas do navegador
 * Implementa geração de PDF simples para relatórios
 */

export interface PDFData {
  title: string;
  content: string;
  date: string;
  author: string;
}

export class PDFGenerator {
  /**
   * Gera PDF da agenda do dia
   */
  static async generateDailyAppointmentsPDF(appointments: any[]): Promise<void> {
    const today = new Date().toLocaleDateString('pt-BR');
    const content = this.generateDailyAppointmentsHTML(appointments, today);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  /**
   * Gera PDF de relatório financeiro
   */
  static async generateFinancialReportPDF(transactions: any[]): Promise<void> {
    const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const content = this.generateFinancialReportHTML(transactions, month);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  /**
   * Gera PDF de prontuário médico
   */
  static async generateMedicalRecordPDF(record: any, patient: any): Promise<void> {
    const content = this.generateMedicalRecordHTML(record, patient);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  /**
   * Gera HTML para agenda do dia
   */
  private static generateDailyAppointmentsHTML(appointments: any[], date: string): string {
    const totalAppointments = appointments.length;
    const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agenda do Dia - ${date}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .header .date {
            color: #666;
            font-size: 18px;
            margin-top: 5px;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
          }
          .stat {
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .stat-label {
            color: #666;
            font-size: 14px;
          }
          .appointments {
            margin-top: 20px;
          }
          .appointment {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background: white;
          }
          .appointment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .appointment-time {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
          }
          .appointment-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-scheduled { background: #fef3c7; color: #92400e; }
          .status-confirmed { background: #d1fae5; color: #065f46; }
          .status-completed { background: #dbeafe; color: #1e40af; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
          .appointment-patient {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .appointment-notes {
            color: #6b7280;
            font-size: 14px;
            font-style: italic;
          }
          .no-appointments {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 40px;
          }
          @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            .appointment { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Agenda do Dia</h1>
          <div class="date">${date}</div>
        </div>

        <div class="stats">
          <div class="stat">
            <div class="stat-number">${totalAppointments}</div>
            <div class="stat-label">Total de Consultas</div>
          </div>
          <div class="stat">
            <div class="stat-number">${confirmedAppointments}</div>
            <div class="stat-label">Confirmadas</div>
          </div>
          <div class="stat">
            <div class="stat-number">${completedAppointments}</div>
            <div class="stat-label">Realizadas</div>
          </div>
        </div>

        <div class="appointments">
          ${appointments.length === 0 ? 
            '<div class="no-appointments">Nenhuma consulta agendada para hoje</div>' :
            appointments
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map(appointment => `
                <div class="appointment">
                  <div class="appointment-header">
                    <div class="appointment-time">${appointment.start_time}</div>
                    <div class="appointment-status status-${appointment.status}">${appointment.status}</div>
                  </div>
                  <div class="appointment-patient">${appointment.patient?.name || 'Paciente'}</div>
                  ${appointment.notes ? `<div class="appointment-notes">${appointment.notes}</div>` : ''}
                </div>
              `).join('')
          }
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Gera HTML para relatório financeiro
   */
  private static generateFinancialReportHTML(transactions: any[], month: string): string {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const netIncome = totalIncome - totalExpenses;

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório Financeiro - ${month}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .header .month {
            color: #666;
            font-size: 18px;
            margin-top: 5px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #2563eb;
          }
          .summary-card.income { border-left-color: #10b981; }
          .summary-card.expense { border-left-color: #ef4444; }
          .summary-card.net { border-left-color: #8b5cf6; }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .summary-value.income { color: #10b981; }
          .summary-value.expense { color: #ef4444; }
          .summary-value.net { color: #8b5cf6; }
          .summary-label {
            color: #666;
            font-size: 14px;
          }
          .transactions {
            margin-top: 20px;
          }
          .transaction {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            gap: 15px;
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
            align-items: center;
          }
          .transaction-header {
            background: #f8fafc;
            font-weight: bold;
            border-bottom: 2px solid #e5e7eb;
          }
          .transaction-type {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .type-income { background: #d1fae5; color: #065f46; }
          .type-expense { background: #fee2e2; color: #991b1b; }
          .transaction-amount {
            font-weight: bold;
            text-align: right;
          }
          .amount-income { color: #10b981; }
          .amount-expense { color: #ef4444; }
          @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            .summary { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório Financeiro</h1>
          <div class="month">${month}</div>
        </div>

        <div class="summary">
          <div class="summary-card income">
            <div class="summary-value income">R$ ${totalIncome.toFixed(2)}</div>
            <div class="summary-label">Receitas</div>
          </div>
          <div class="summary-card expense">
            <div class="summary-value expense">R$ ${totalExpenses.toFixed(2)}</div>
            <div class="summary-label">Despesas</div>
          </div>
          <div class="summary-card net">
            <div class="summary-value net">R$ ${netIncome.toFixed(2)}</div>
            <div class="summary-label">Resultado Líquido</div>
          </div>
        </div>

        <div class="transactions">
          <div class="transaction transaction-header">
            <div>Data</div>
            <div>Descrição</div>
            <div>Categoria</div>
            <div>Tipo</div>
            <div>Valor</div>
          </div>
          ${transactions
            .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
            .map(transaction => `
              <div class="transaction">
                <div>${new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}</div>
                <div>${transaction.description || '-'}</div>
                <div>${transaction.category || '-'}</div>
                <div class="transaction-type type-${transaction.type}">${transaction.type}</div>
                <div class="transaction-amount amount-${transaction.type}">R$ ${(transaction.amount || 0).toFixed(2)}</div>
              </div>
            `).join('')
          }
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Gera HTML para prontuário médico
   */
  private static generateMedicalRecordHTML(record: any, patient: any): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prontuário Médico - ${patient?.name || 'Paciente'}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .patient-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .patient-info h2 {
            color: #1f2937;
            margin: 0 0 15px 0;
            font-size: 20px;
          }
          .patient-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .patient-detail {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .patient-detail:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #4b5563;
          }
          .detail-value {
            color: #1f2937;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h3 {
            color: #2563eb;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .section-content {
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            white-space: pre-wrap;
            font-size: 14px;
            line-height: 1.5;
          }
          .version-info {
            text-align: right;
            color: #6b7280;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            .patient-info { page-break-after: avoid; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Prontuário Médico</h1>
        </div>

        <div class="patient-info">
          <h2>Dados do Paciente</h2>
          <div class="patient-details">
            <div class="patient-detail">
              <span class="detail-label">Nome:</span>
              <span class="detail-value">${patient?.name || '-'}</span>
            </div>
            <div class="patient-detail">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${patient?.email || '-'}</span>
            </div>
            <div class="patient-detail">
              <span class="detail-label">Telefone:</span>
              <span class="detail-value">${patient?.phone || '-'}</span>
            </div>
            <div class="patient-detail">
              <span class="detail-label">Data de Nascimento:</span>
              <span class="detail-value">${patient?.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : '-'}</span>
            </div>
          </div>
        </div>

        ${record.anamnesis ? `
          <div class="section">
            <h3>Anamnese</h3>
            <div class="section-content">${record.anamnesis}</div>
          </div>
        ` : ''}

        ${record.diagnosis ? `
          <div class="section">
            <h3>Diagnóstico</h3>
            <div class="section-content">${record.diagnosis}</div>
          </div>
        ` : ''}

        ${record.treatment_plan ? `
          <div class="section">
            <h3>Plano de Tratamento</h3>
            <div class="section-content">${record.treatment_plan}</div>
          </div>
        ` : ''}

        ${record.notes ? `
          <div class="section">
            <h3>Observações</h3>
            <div class="section-content">${record.notes}</div>
          </div>
        ` : ''}

        <div class="version-info">
          <p>Versão ${record.version || 1} - Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;
  }
}

