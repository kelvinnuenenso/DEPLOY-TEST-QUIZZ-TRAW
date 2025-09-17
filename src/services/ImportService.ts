// Firecrawl SDK removed for browser builds; using Edge Function proxy
// import Firecrawl from '@mendable/firecrawl-js';
import { Quiz, Question, QuestionType } from '@/types/quiz';
import { z } from 'zod';

interface ImportResult {
  success: boolean;
  data?: Quiz;
  error?: string;
}

interface PlatformData {
  platform: string;
  title: string;
  description?: string;
  questions: Question[];
  rawData: Record<string, unknown>;
}

export class ImportService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('Firecrawl API key saved');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

static async testApiKey(apiKey: string): Promise<boolean> {
  try {
    if (!apiKey || !apiKey.startsWith('fc-')) return false;
    // Try calling an Edge Function if available; otherwise pass local validation
    const res = await fetch('/functions/v1/firecrawl/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ test: true })
    }).catch(() => null as Response | null);
    return res ? res.ok : true;
  } catch (error) {
    console.error('Error testing API key:', error);
    return false;
  }
}

static async importQuiz(url: string): Promise<ImportResult> {
  const apiKey = this.getApiKey();
  if (!apiKey) {
    return { success: false, error: 'API key not found. Please configure your Firecrawl API key.' };
  }

  try {
    console.log('Requesting scrape via Edge Function:', url);
    const response = await fetch('/functions/v1/firecrawl/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
        includeTags: ['form', 'input', 'select', 'textarea', 'button', 'label'],
        waitFor: 2000
      })
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return {
        success: false,
        error: text || 'Failed to scrape via Edge Function. Ensure the Supabase Edge Function "firecrawl" is deployed and FIRECRAWL_API_KEY is set.'
      };
    }

    const scrapeResponse = await response.json();
    if (!scrapeResponse) {
      return { success: false, error: 'Empty response from scraper' };
    }

    const platformData = this.parseScrapedData(url, scrapeResponse);
    if (!platformData) {
      return {
        success: false,
        error: 'Could not detect a supported quiz platform or extract questions from this URL.'
      };
    }

    const quiz = this.convertToQuiz(platformData);
    return { success: true, data: quiz };
  } catch (error) {
    console.error('Error importing quiz:', error);
    return {
      success: false,
      error: 'Scraping requires a backend proxy. Please connect Supabase and deploy an Edge Function named "firecrawl".'
    };
  }
}

  private static parseScrapedData(url: string, data: Record<string, unknown>): PlatformData | null {
    const { markdown, html } = data;
    
    // Detect platform
    let platform = 'unknown';
    if (url.includes('typeform.com')) {
      platform = 'typeform';
    } else if (url.includes('forms.gle') || url.includes('docs.google.com/forms')) {
      platform = 'google_forms';
    } else if (url.includes('forms.office.com') || url.includes('forms.microsoft.com')) {
      platform = 'microsoft_forms';
    }

    // Use platform-specific parsers
    switch (platform) {
      case 'typeform':
        return this.parseTypeform(url, html, markdown);
      case 'google_forms':
        return this.parseGoogleForms(url, html, markdown);
      case 'microsoft_forms':
        return this.parseMicrosoftForms(url, html, markdown);
      default:
        return this.parseGenericForm(url, html, markdown);
    }
  }

  private static parseTypeform(url: string, html: string, markdown: string): PlatformData | null {
    try {
      // Extract title from markdown or HTML
      const titleMatch = markdown.match(/^#\s+(.+)/m) || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Quiz Importado do Typeform';

      // Extract questions from markdown
      const questions: Omit<Question, 'id'>[] = [];
      const questionMatches = markdown.match(/(\d+\.\s+.+?)(?=\d+\.\s+|\n\n|$)/gs) || [];
      
      questionMatches.forEach((match, index) => {
        const lines = match.trim().split('\n');
        const questionText = lines[0].replace(/^\d+\.\s+/, '');
        
        // Look for options (- bullets or letters)
        const options: { text: string; isCorrect: boolean }[] = [];
        const optionMatches = lines.slice(1).filter(line => 
          line.trim().match(/^[-*]\s+/) || line.trim().match(/^[a-zA-Z]\)\s+/)
        );
        
        optionMatches.forEach((option, optIndex) => {
          const optionText = option.replace(/^[-*a-zA-Z)]\s+/, '').trim();
          if (optionText) {
            options.push({
              id: crypto.randomUUID(),
              label: optionText,
              score: 10 - optIndex
            });
          }
        });

        if (questionText) {
          questions.push({
            text: questionText,
            type: options.length > 0 ? 'multiple_choice' : 'text',
            options: options
          });
        }
      });

      return {
        platform: 'typeform',
        title,
        questions,
        rawData: { html, markdown }
      };
    } catch (error) {
      console.error('Error parsing Typeform:', error);
      return null;
    }
  }

  private static parseGoogleForms(url: string, html: string, markdown: string): PlatformData | null {
    try {
      // Google Forms often has the title in specific meta tags or headers
      const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) ||
                        markdown.match(/^#\s+(.+)/m) ||
                        html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Quiz Importado do Google Forms';

      const questions: Omit<Question, 'id'>[] = [];
      
      // Look for question patterns in markdown
      const questionPattern = /(\d+\.\s+.+?)(?=\d+\.\s+|\n\n|$)/gs;
      const questionMatches = markdown.match(questionPattern) || [];
      
      questionMatches.forEach(match => {
        const lines = match.trim().split('\n');
        const questionText = lines[0].replace(/^\d+\.\s+/, '');
        
        const options: { id: string; label: string; score: number }[] = [];
        lines.slice(1).forEach((line, index) => {
          const optionMatch = line.match(/^[-*○●]\s+(.+)/);
          if (optionMatch) {
            options.push({
              id: crypto.randomUUID(),
              label: optionMatch[1].trim(),
              score: 10 - index
            });
          }
        });

        if (questionText) {
          questions.push({
            text: questionText,
            type: options.length > 0 ? 'multiple_choice' : 'text',
            options
          });
        }
      });

      return {
        platform: 'google_forms',
        title,
        questions,
        rawData: { html, markdown }
      };
    } catch (error) {
      console.error('Error parsing Google Forms:', error);
      return null;
    }
  }

  private static parseMicrosoftForms(url: string, html: string, markdown: string): PlatformData | null {
    try {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i) ||
                        markdown.match(/^#\s+(.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : 'Quiz Importado do Microsoft Forms';

      const questions: Omit<Question, 'id'>[] = [];
      
      // Basic parsing for Microsoft Forms
      const questionMatches = markdown.match(/(\d+\.\s+.+?)(?=\d+\.\s+|\n\n|$)/gs) || [];
      
      questionMatches.forEach(match => {
        const lines = match.trim().split('\n');
        const questionText = lines[0].replace(/^\d+\.\s+/, '');
        
        if (questionText) {
          questions.push({
            text: questionText,
            type: 'text',
            options: []
          });
        }
      });

      return {
        platform: 'microsoft_forms',
        title,
        questions,
        rawData: { html, markdown }
      };
    } catch (error) {
      console.error('Error parsing Microsoft Forms:', error);
      return null;
    }
  }

  private static parseGenericForm(url: string, html: string, markdown: string): PlatformData | null {
    try {
      // Generic form parsing - look for form elements
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i) ||
                        html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                        markdown.match(/^#\s+(.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : 'Quiz Importado';

      const questions: Omit<Question, 'id'>[] = [];
      
      // Look for form inputs in HTML
      const inputMatches = html.match(/<input[^>]+type=["'](?:text|email|radio|checkbox)[^>]*>/gi) || [];
      const labelMatches = html.match(/<label[^>]*>([^<]+)<\/label>/gi) || [];
      
      labelMatches.forEach((label, index) => {
        const labelText = label.replace(/<[^>]*>/g, '').trim();
        if (labelText && labelText.length > 3) {
          questions.push({
            text: labelText,
            type: 'text',
            options: []
          });
        }
      });

      // Fallback to markdown questions
      if (questions.length === 0) {
        const questionMatches = markdown.match(/(\d+\.\s+.+?)(?=\d+\.\s+|\n\n|$)/gs) || [];
        
        questionMatches.forEach(match => {
          const questionText = match.replace(/^\d+\.\s+/, '').trim();
          if (questionText) {
            questions.push({
              text: questionText,
              type: 'text',
              options: []
            });
          }
        });
      }

      return questions.length > 0 ? {
        platform: 'generic',
        title,
        questions,
        rawData: { html, markdown }
      } : null;
    } catch (error) {
      console.error('Error parsing generic form:', error);
      return null;
    }
  }

  private static convertToQuiz(platformData: PlatformData): Quiz {
    const questions: Question[] = platformData.questions.map((q, index) => {
      let questionType: QuestionType = 'short_text';
      
      // Map question types
      if (q.type === 'multiple_choice' && q.options?.length > 0) {
        questionType = q.options.length <= 4 ? 'single' : 'multiple';
      } else if (q.text?.toLowerCase().includes('email')) {
        questionType = 'email';
      } else if (q.text?.toLowerCase().includes('phone') || q.text?.toLowerCase().includes('telefone')) {
        questionType = 'phone';
      } else if (q.text?.toLowerCase().includes('rate') || q.text?.toLowerCase().includes('avali')) {
        questionType = 'rating';
      }

      return {
        id: crypto.randomUUID(),
        idx: index + 1,
        type: questionType,
        title: q.text,
        description: '',
        options: q.options || undefined,
        required: true
      };
    });

    return {
      id: crypto.randomUUID(),
      publicId: Math.random().toString(36).slice(2, 8),
      name: platformData.title,
      description: `Quiz importado de ${platformData.platform}`,
      status: 'draft',
      theme: {
        primary: '#2563EB',
        background: '#FFFFFF',
        text: '#0B0B0B'
      },
      settings: {
        progressBar: true,
        requireEmail: false
      },
      questions,
      outcomes: {
        default: {
          title: 'Obrigado pela participação!',
          description: 'Recebemos suas respostas.',
          cta: {
            label: 'Entrar em contato',
            href: '#'
          }
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}