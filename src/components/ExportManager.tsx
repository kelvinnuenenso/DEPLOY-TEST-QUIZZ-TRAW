import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { localDB } from '@/lib/localStorage';
import {
  Download,
  FileText,
  Table,
  Users,
  BarChart3,
  Calendar,
  Mail,
  Share2
} from 'lucide-react';

interface ExportManagerProps {
  quizId?: string;
}

export function ExportManager({ quizId }: ExportManagerProps) {
  const [exportType, setExportType] = useState('leads');
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'name', 'email', 'createdAt', 'answers'
  ]);
  const [isExporting, setIsExporting] = useState(false);

  const exportTypes = [
    { value: 'leads', label: 'Leads e Contatos', icon: Users },
    { value: 'results', label: 'Respostas do Quiz', icon: FileText },
    { value: 'analytics', label: 'Dados de Analytics', icon: BarChart3 },
    { value: 'complete', label: 'Relatório Completo', icon: Table }
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV (Excel)', extension: '.csv' },
    { value: 'json', label: 'JSON', extension: '.json' },
    { value: 'xlsx', label: 'Excel (.xlsx)', extension: '.xlsx' },
    { value: 'pdf', label: 'PDF Report', extension: '.pdf' }
  ];

  const fieldOptions = {
    leads: [
      { id: 'name', label: 'Nome' },
      { id: 'email', label: 'Email' },
      { id: 'phone', label: 'Telefone' },
      { id: 'createdAt', label: 'Data de Criação' },
      { id: 'quizName', label: 'Nome do Quiz' },
      { id: 'source', label: 'Origem (UTM)' },
      { id: 'answers', label: 'Respostas' },
      { id: 'score', label: 'Pontuação' },
      { id: 'outcome', label: 'Resultado' }
    ],
    results: [
      { id: 'startedAt', label: 'Data de Início' },
      { id: 'completedAt', label: 'Data de Conclusão' },
      { id: 'timeSpent', label: 'Tempo Gasto' },
      { id: 'score', label: 'Pontuação' },
      { id: 'outcome', label: 'Resultado' },
      { id: 'answers', label: 'Todas as Respostas' },
      { id: 'device', label: 'Dispositivo' },
      { id: 'utm', label: 'Parâmetros UTM' }
    ],
    analytics: [
      { id: 'date', label: 'Data' },
      { id: 'views', label: 'Visualizações' },
      { id: 'starts', label: 'Iniciados' },
      { id: 'completions', label: 'Concluídos' },
      { id: 'leads', label: 'Leads Gerados' },
      { id: 'conversionRate', label: 'Taxa de Conversão' },
      { id: 'bounceRate', label: 'Taxa de Abandono' },
      { id: 'avgTimeSpent', label: 'Tempo Médio' }
    ]
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const generateCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');

    return csvContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let data: any[] = [];
      let filename = '';

      // Get data based on export type
      switch (exportType) {
        case 'leads':
          const leads = quizId 
            ? localDB.getQuizLeads(quizId)
            : localDB.getAllLeads();
          
          data = leads.map(lead => ({
            name: lead.name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            createdAt: new Date(lead.createdAt).toLocaleDateString(),
            quizName: localDB.getQuiz(lead.quizId)?.name || '',
            source: 'Direto', // Mock UTM data
            answers: JSON.stringify(lead.customFields || {}),
            score: Math.floor(Math.random() * 100), // Mock score
            outcome: 'Qualified Lead' // Mock outcome
          }));
          
          filename = `leads-${new Date().toISOString().split('T')[0]}`;
          break;

        case 'results':
          const results = localDB.getQuizResults(quizId || '');
          data = results.map(result => ({
            startedAt: new Date(result.startedAt).toLocaleString(),
            completedAt: result.completedAt ? new Date(result.completedAt).toLocaleString() : '',
            timeSpent: result.completedAt ? 
              Math.round((new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 1000 / 60) + ' min' : '',
            score: result.score || 0,
            outcome: result.outcomeKey || '',
            answers: JSON.stringify(result.answers),
            device: 'Desktop', // Mock device data
            utm: JSON.stringify(result.utm || {})
          }));
          
          filename = `results-${new Date().toISOString().split('T')[0]}`;
          break;

        case 'analytics':
          const analytics = localDB.getAnalytics(quizId || '');
          data = analytics.map(item => ({
            date: item.date,
            views: item.views,
            starts: item.starts,
            completions: item.completions,
            leads: item.leads,
            conversionRate: item.starts > 0 ? ((item.completions / item.starts) * 100).toFixed(1) + '%' : '0%',
            bounceRate: item.bounceRate.toFixed(1) + '%',
            avgTimeSpent: item.avgTimeSpent.toFixed(1) + ' min'
          }));
          
          filename = `analytics-${new Date().toISOString().split('T')[0]}`;
          break;

        case 'complete':
          // Combine all data types
          const completeData = {
            exportDate: new Date().toISOString(),
            quiz: localDB.getQuiz(quizId || ''),
            leads: localDB.getQuizLeads(quizId || ''),
            results: localDB.getQuizResults(quizId || ''),
            analytics: localDB.getAnalytics(quizId || '')
          };
          
          if (format === 'json') {
            downloadFile(
              JSON.stringify(completeData, null, 2),
              `complete-report-${new Date().toISOString().split('T')[0]}.json`,
              'application/json'
            );
            return;
          }
          break;
      }

      // Filter data by selected fields
      const filteredData = data.map(item => {
        const filtered: any = {};
        selectedFields.forEach(field => {
          if (item.hasOwnProperty(field)) {
            filtered[field] = item[field];
          }
        });
        return filtered;
      });

      // Generate and download file
      switch (format) {
        case 'csv':
          const csv = generateCSV(filteredData, selectedFields);
          downloadFile(csv, `${filename}.csv`, 'text/csv');
          break;

        case 'json':
          downloadFile(
            JSON.stringify(filteredData, null, 2),
            `${filename}.json`,
            'application/json'
          );
          break;

        case 'xlsx':
          // For now, fall back to CSV (in real app, use a library like xlsx)
          const xlsxCsv = generateCSV(filteredData, selectedFields);
          downloadFile(xlsxCsv, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;

        case 'pdf':
          // Mock PDF generation (in real app, use jsPDF or similar)
          const pdfContent = `
ELEVADO QUIZZ - RELATÓRIO DE EXPORTAÇÃO
Data: ${new Date().toLocaleDateString()}
Tipo: ${exportTypes.find(t => t.value === exportType)?.label}

Total de registros: ${filteredData.length}

${filteredData.map((item, index) => 
  `Registro ${index + 1}:\n${Object.entries(item).map(([key, value]) => 
    `  ${key}: ${value}`
  ).join('\n')}`
).join('\n\n')}
          `;
          downloadFile(pdfContent, `${filename}.txt`, 'text/plain');
          break;
      }

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const currentFields = fieldOptions[exportType as keyof typeof fieldOptions] || fieldOptions.leads;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Dados
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Dados do Quiz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tipo de Exportação</Label>
            <div className="grid grid-cols-2 gap-3">
              {exportTypes.map(type => {
                const IconComponent = type.icon;
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      exportType === type.value ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                    }`}
                    onClick={() => setExportType(type.value)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${
                        exportType === type.value ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div>
                        <p className={`font-medium ${exportType === type.value ? 'text-primary' : ''}`}>
                          {type.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Formato do Arquivo</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map(fmt => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Campos a Exportar ({selectedFields.length} selecionados)
            </Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {currentFields.map(field => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <Label htmlFor={field.id} className="text-sm cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range (for analytics) */}
          {exportType === 'analytics' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os dados</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Export Summary */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium">Resumo da Exportação</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Tipo: <Badge variant="secondary">{exportTypes.find(t => t.value === exportType)?.label}</Badge></div>
                  <div>Formato: <Badge variant="secondary">{formatOptions.find(f => f.value === format)?.label}</Badge></div>
                  <div>Campos: {selectedFields.length} selecionados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleExport} 
              disabled={selectedFields.length === 0 || isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Agora
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}