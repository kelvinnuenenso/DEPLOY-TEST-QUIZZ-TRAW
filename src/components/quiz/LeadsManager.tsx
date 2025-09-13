import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { localDB } from '@/lib/localStorage';
import { Lead, Quiz, Result } from '@/types/quiz';
import { 
  Users, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Mail,
  Phone,
  User,
  Tag,
  MoreHorizontal,
  Eye,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeadsManagerProps {
  quizId?: string;
}

interface LeadWithDetails extends Lead {
  quiz: Quiz;
  result: Result;
  score?: number;
  outcomeKey?: string;
}

const LeadsManager = ({ quizId }: LeadsManagerProps) => {
  const [leads, setLeads] = useState<LeadWithDetails[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuiz, setFilterQuiz] = useState<string>(quizId || 'all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLeads();
  }, [quizId]);

  useEffect(() => {
    applyFilters();
  }, [leads, searchTerm, filterQuiz, filterDate]);

  const loadLeads = () => {
    setLoading(true);
    try {
      const allLeads = quizId ? localDB.getQuizLeads(quizId) : localDB.getAllLeads();
      const allQuizzes = localDB.getAllQuizzes();
      const allResults = quizId ? localDB.getQuizResults(quizId) : [];

      const leadsWithDetails: LeadWithDetails[] = allLeads.map(lead => {
        const quiz = allQuizzes.find(q => q.id === lead.quizId);
        const result = allResults.find(r => r.id === lead.resultId);
        
        return {
          ...lead,
          quiz: quiz!,
          result: result!,
          score: result?.score,
          outcomeKey: result?.outcomeKey
        };
      }).filter(lead => lead.quiz); // Only include leads with valid quiz

      setLeads(leadsWithDetails);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os leads.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.quiz.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Quiz filter
    if (filterQuiz !== 'all') {
      filtered = filtered.filter(lead => lead.quizId === filterQuiz);
    }

    // Date filter
    if (filterDate !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (filterDate) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(lead => 
        new Date(lead.createdAt) >= startDate
      );
    }

    setFilteredLeads(filtered);
  };

  const exportLeads = () => {
    const csvData = [
      ['Nome', 'Email', 'Telefone', 'Quiz', 'Pontuação', 'Resultado', 'Data'],
      ...filteredLeads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.quiz.name,
        lead.score?.toString() || '',
        lead.outcomeKey || '',
        new Date(lead.createdAt).toLocaleDateString('pt-BR')
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads-${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: 'Exportação concluída',
      description: 'Os leads foram exportados para CSV.'
    });
  };

  const getAvailableQuizzes = () => {
    const quizzes = localDB.getAllQuizzes();
    return quizzes.filter(quiz => 
      leads.some(lead => lead.quizId === quiz.id)
    );
  };

  const generateWhatsAppLink = (lead: LeadWithDetails) => {
    if (!lead.phone) return '#';
    
    const phone = lead.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${lead.name || 'usuário'}! Vi que você participou do nosso quiz "${lead.quiz.name}" e gostaria de conversar com você sobre os resultados.`
    );
    
    return `https://wa.me/55${phone}?text=${message}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Leads</h2>
          <p className="text-muted-foreground">
            {filteredLeads.length} de {leads.length} leads
          </p>
        </div>
        <Button onClick={exportLeads} disabled={filteredLeads.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterQuiz} onValueChange={setFilterQuiz}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por quiz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os quizzes</SelectItem>
                {getAvailableQuizzes().map(quiz => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo período</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{leads.length}</p>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {leads.filter(l => l.email).length}
                </p>
                <p className="text-sm text-muted-foreground">Com Email</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {leads.filter(l => l.phone).length}
                </p>
                <p className="text-sm text-muted-foreground">Com Telefone</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {leads.filter(l => 
                    new Date(l.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {leads.length === 0 ? 'Nenhum lead encontrado.' : 'Nenhum lead corresponde aos filtros aplicados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Contato</th>
                    <th className="text-left p-3">Quiz</th>
                    <th className="text-left p-3">Pontuação</th>
                    <th className="text-left p-3">Resultado</th>
                    <th className="text-left p-3">Data</th>
                    <th className="text-center p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">
                            {lead.name || 'Nome não informado'}
                          </p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{lead.quiz.name}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">
                          {lead.score || 0} pts
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge>
                          {lead.outcomeKey || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLead(lead)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalhes do Lead</DialogTitle>
                              </DialogHeader>
                              
                              {selectedLead && (
                                <div className="space-y-4">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Nome</Label>
                                      <p className="mt-1">{selectedLead.name || 'Não informado'}</p>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <p className="mt-1">{selectedLead.email || 'Não informado'}</p>
                                    </div>
                                    <div>
                                      <Label>Telefone</Label>
                                      <p className="mt-1">{selectedLead.phone || 'Não informado'}</p>
                                    </div>
                                    <div>
                                      <Label>Data</Label>
                                      <p className="mt-1">
                                        {new Date(selectedLead.createdAt).toLocaleString('pt-BR')}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label>Quiz</Label>
                                    <p className="mt-1">{selectedLead.quiz.name}</p>
                                  </div>
                                  
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Pontuação</Label>
                                      <p className="mt-1">{selectedLead.score || 0} pontos</p>
                                    </div>
                                    <div>
                                      <Label>Resultado</Label>
                                      <p className="mt-1">{selectedLead.outcomeKey || 'N/A'}</p>
                                    </div>
                                  </div>

                                  {selectedLead.tags && selectedLead.tags.length > 0 && (
                                    <div>
                                      <Label>Tags</Label>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedLead.tags.map(tag => (
                                          <Badge key={tag} variant="outline">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {lead.phone && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={generateWhatsAppLink(lead)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </Button>
                          )}

                          {lead.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={`mailto:${lead.email}`}>
                                <Mail className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsManager;