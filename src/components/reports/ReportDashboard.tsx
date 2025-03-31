import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DatePickerWithRange } from '../ui/date-range-picker';
import { Button } from '../ui/button';
import { ReportService, ReportData, ReportFilters } from '../../services/reportService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useTheme } from '../../hooks/useTheme';

const reportService = ReportService.getInstance();

export function ReportDashboard() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const chartColors = {
    text: theme === 'dark' ? '#e5e7eb' : '#374151',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    stroke: {
      primary: theme === 'dark' ? '#8b5cf6' : '#6366f1',
      secondary: theme === 'dark' ? '#10b981' : '#22c55e',
    },
  };

  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    if (range) {
      setFilters(prev => ({
        ...prev,
        startDate: range.from,
        endDate: range.to,
      }));
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.generateFullReport(filters);
      setReportData(data);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6" data-testid="report-dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Relatórios</h1>
        
        <div className="flex gap-4 mb-6">
          <DatePickerWithRange
            onChange={handleDateRangeChange}
            data-testid="date-range-picker"
          />
          <Button
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
        </div>
      </div>

      {reportData && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="loans">Empréstimos</TabsTrigger>
            <TabsTrigger value="fines">Multas</TabsTrigger>
            <TabsTrigger value="books">Livros</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4" data-testid="report-overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Empréstimos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.totalLoans}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Empréstimos em Atraso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {reportData.totalOverdue}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total em Multas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {reportData.totalFines.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Multas Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    R$ {reportData.totalPendingFines.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>Estatísticas Mensais</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={reportData.monthlyStats}
                    className={theme}
                    data-testid="monthly-chart"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                    />
                    <XAxis
                      dataKey="month"
                      stroke={chartColors.text}
                    />
                    <YAxis stroke={chartColors.text} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        borderColor: chartColors.grid,
                        color: chartColors.text,
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        color: chartColors.text,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalLoans"
                      name="Empréstimos"
                      stroke={chartColors.stroke.primary}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalReturns"
                      name="Devoluções"
                      stroke={chartColors.stroke.secondary}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="books" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Livros Mais Emprestados</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={reportData.mostBorrowedBooks}
                    className={theme}
                    data-testid="books-chart"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                    />
                    <XAxis
                      dataKey="title"
                      stroke={chartColors.text}
                    />
                    <YAxis stroke={chartColors.text} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        borderColor: chartColors.grid,
                        color: chartColors.text,
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        color: chartColors.text,
                      }}
                    />
                    <Bar
                      dataKey="totalLoans"
                      name="Total de Empréstimos"
                      fill={chartColors.stroke.primary}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas por Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto" data-testid="users-table">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left p-2">Usuário</th>
                        <th className="text-right p-2">Empréstimos</th>
                        <th className="text-right p-2">Em Atraso</th>
                        <th className="text-right p-2">Total em Multas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.userStats.map(user => (
                        <tr
                          key={user.id}
                          className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="p-2">{user.name}</td>
                          <td className="text-right p-2">{user.totalLoans}</td>
                          <td className="text-right p-2 text-red-600 dark:text-red-400">
                            {user.totalOverdue}
                          </td>
                          <td className="text-right p-2">
                            R$ {user.totalFines.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 