// Enhanced error logging and monitoring

interface ErrorContext {
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  component?: string;
  props?: any;
  componentStack?: string;
}

class ErrorLogger {
  private errors: Array<{ error: Error; context: ErrorContext }> = [];
  private maxErrors = 50;

  log(error: Error, context: Partial<ErrorContext> = {}) {
    const errorEntry = {
      error,
      context: {
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    };

    this.errors.unshift(errorEntry);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Enhanced logging
    console.group(`🚨 Error logged at ${new Date().toLocaleTimeString()}`);
    console.error('Error:', error);
    console.error('Context:', errorEntry.context);
    console.error('Stack:', error.stack);
    console.groupEnd();

    // Check for error patterns
    this.checkErrorPatterns();
  }

  private checkErrorPatterns() {
    const recentErrors = this.errors.slice(0, 5);
    const errorMessages = recentErrors.map(e => e.error.message);
    
    // Check for repeated errors
    const repeatedError = errorMessages.find((msg, index) => 
      errorMessages.filter(m => m === msg).length > 2
    );

    if (repeatedError) {
      console.warn(`🔄 Repeated error detected: ${repeatedError}`);
      console.warn('Consider implementing specific fix for this error');
    }

    // Check for rapid succession errors
    const rapidErrors = recentErrors.filter(e => 
      Date.now() - e.context.timestamp < 5000
    );

    if (rapidErrors.length >= 3) {
      console.warn('🚀 Rapid error succession detected - possible cascade failure');
    }
  }

  getRecentErrors(count: number = 10) {
    return this.errors.slice(0, count);
  }

  clearErrors() {
    this.errors = [];
  }

  exportErrors() {
    return {
      errors: this.errors.map(({ error, context }) => ({
        message: error.message,
        stack: error.stack,
        name: error.name,
        context
      })),
      exportedAt: new Date().toISOString()
    };
  }
}

export const errorLogger = new ErrorLogger();
