import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AIDebugPanel({ result, isDebugging, error, onApplyFix }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (result?.correctedCode) {
      navigator.clipboard.writeText(result.correctedCode);
      setCopied(true);
      toast.success('Corrected code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="ai-debug-panel">
      <div className="ai-debug-header">
        <div className="ai-debug-header-left">
          <Sparkles size={14} className="text-violet-400" />
          <span className="ai-debug-title">AI Debug Assistant</span>
        </div>
        {result && (
          <Badge className="ai-debug-badge">Analysis Complete</Badge>
        )}
      </div>

      <ScrollArea className="ai-debug-content">
        {isDebugging && (
          <div className="ai-debug-loading">
            <div className="ai-debug-loading-icon">
              <Loader2 className="animate-spin" size={24} />
            </div>
            <span>AI is analyzing your code...</span>
            <div className="ai-debug-skeleton">
              <div className="skeleton-line skeleton-line--long" />
              <div className="skeleton-line skeleton-line--medium" />
              <div className="skeleton-line skeleton-line--short" />
            </div>
          </div>
        )}

        {error && (
          <div className="ai-debug-error">
            <span>❌ {error}</span>
            <p>Make sure your OpenAI API key is configured in the server .env file.</p>
          </div>
        )}

        {result && (
          <div className="ai-debug-result">
            <div className="ai-debug-section">
              <div className="ai-debug-section-header">
                <span className="ai-debug-section-icon">🔴</span>
                <span className="ai-debug-section-title">Error</span>
              </div>
              <p className="ai-debug-section-text">{result.error}</p>
            </div>

            <div className="ai-debug-section">
              <div className="ai-debug-section-header">
                <span className="ai-debug-section-icon">📝</span>
                <span className="ai-debug-section-title">Explanation</span>
              </div>
              <p className="ai-debug-section-text">{result.explanation}</p>
            </div>

            <div className="ai-debug-section">
              <div className="ai-debug-section-header">
                <span className="ai-debug-section-icon">💡</span>
                <span className="ai-debug-section-title">Suggestion</span>
              </div>
              <p className="ai-debug-section-text">{result.suggestion}</p>
            </div>

            {result.correctedCode && (
              <div className="ai-debug-section">
                <div className="ai-debug-section-header">
                  <span className="ai-debug-section-icon">✅</span>
                  <span className="ai-debug-section-title">Corrected Code</span>
                  <div className="ai-debug-code-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ai-debug-copy"
                      onClick={handleCopyCode}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </Button>
                  </div>
                </div>
                <pre className="ai-debug-code">
                  <code>{result.correctedCode}</code>
                </pre>
                <Button
                  onClick={() => onApplyFix(result.correctedCode)}
                  className="ai-debug-apply"
                  size="sm"
                >
                  <Sparkles size={14} />
                  Apply Fix
                </Button>
              </div>
            )}
          </div>
        )}

        {!isDebugging && !result && !error && (
          <div className="ai-debug-empty">
            <Sparkles size={20} className="text-violet-400/50" />
            <span>Click "Debug" to get AI-powered analysis of your code</span>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
