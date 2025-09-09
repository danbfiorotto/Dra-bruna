import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useFinancial } from '../hooks/useFinancial';

export function Financial() {
  const {
    transactions,
    isLoading,
    error,
    getCurrentMonthIncome,
    getCurrentMonthExpenses,
    getCurrentMonthProfit,
    loadData
  } = useFinancial();

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyProfit, setMonthlyProfit] = useState(0);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [income, expenses, profit] = await Promise.all([
          getCurrentMonthIncome(),
          getCurrentMonthExpenses(),
          getCurrentMonthProfit()
        ]);
        setMonthlyIncome(income);
        setMonthlyExpenses(expenses);
        setMonthlyProfit(profit);
      } catch (err) {
        console.error('Failed to load financial stats:', err);
      }
    };

    loadStats();
  }, [getCurrentMonthIncome, getCurrentMonthExpenses, getCurrentMonthProfit]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar dados financeiros: {error}</p>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="mt-2 text-gray-600">
              Controle financeiro da clínica
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">
              Receitas do mês atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Despesas do mês atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyProfit)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyIncome > 0 ? `Margem de ${((monthlyProfit / monthlyIncome) * 100).toFixed(1)}%` : 'Sem receitas'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Lançamentos</CardTitle>
            <CardDescription>
              Movimentações financeiras recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma transação encontrada</p>
              ) : (
                transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.description || transaction.category}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatório Mensal</CardTitle>
            <CardDescription>
              Resumo financeiro do mês atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total de consultas</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ticket médio</span>
                <span className="font-medium">R$ 180,00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taxa de ocupação</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pacientes únicos</span>
                <span className="font-medium">38</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
