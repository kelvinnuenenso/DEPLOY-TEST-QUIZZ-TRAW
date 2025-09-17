import { Quiz } from '@/types/quiz';
import { saveQuiz } from './quizzes';

// Autosave implementation
class AutoSaveManager {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly AUTOSAVE_DELAY = 3000; // 3 seconds

  scheduleAutosave(quiz: Quiz, onSuccess?: () => void, onError?: (error: Error) => void) {
    // Clear existing timeout for this quiz
    const existingTimeout = this.timeouts.get(quiz.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule new autosave
    const timeout = setTimeout(async () => {
      try {
        const updatedQuiz = {
          ...quiz,
          updatedAt: new Date().toISOString()
        };
        
        await saveQuiz(updatedQuiz);
        
        // Analytics
        console.log('quiz_saved', { 
          quizId: quiz.id, 
          mode: 'auto',
          timestamp: Date.now()
        });
        
        onSuccess?.();
      } catch (error) {
        console.error('Autosave failed:', error);
        onError?.(error);
      }
      
      this.timeouts.delete(quiz.id);
    }, this.AUTOSAVE_DELAY);

    this.timeouts.set(quiz.id, timeout);
  }

  cancelAutosave(quizId: string) {
    const timeout = this.timeouts.get(quizId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(quizId);
    }
  }

  cleanup() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

export const autoSaveManager = new AutoSaveManager();