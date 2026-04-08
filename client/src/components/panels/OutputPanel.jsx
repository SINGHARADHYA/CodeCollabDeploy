import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, CheckCircle2, XCircle, Clock, MemoryStick } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OutputPanel({ output, isRunning, error, onClear }) {
  const getStatusBadge = () => {
    if (isRunning) {
      return (
        <Badge className="output-badge output-badge--running">
          <Loader2 size={12} className="animate-spin" />
          Running
        </Badge>
      );
    }
    if (error) {
      return (
        <Badge className="output-badge output-badge--error">
          <XCircle size={12} />
          Error
        </Badge>
      );
    }
    if (output) {
      const isSuccess = output.status && output.status.id === 3;
      return (
        <Badge className={cn('output-badge', isSuccess ? 'output-badge--success' : 'output-badge--error')}>
          {isSuccess ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {output.status?.description || 'Unknown'}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="output-panel">
      <div className="output-header">
        <div className="output-header-left">
          <span className="output-title">Output</span>
          {getStatusBadge()}
          {output && output.time && (
            <span className="output-meta">
              <Clock size={11} />
              {output.time}s
            </span>
          )}
          {output && output.memory && (
            <span className="output-meta">
              <MemoryStick size={11} />
              {(output.memory / 1024).toFixed(1)} MB
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="output-clear" onClick={onClear}>
          <Trash2 size={12} />
        </Button>
      </div>

      <ScrollArea className="output-content">
        {isRunning && (
          <div className="output-running">
            <Loader2 className="animate-spin" size={20} />
            <span>Executing code...</span>
          </div>
        )}

        {error && (
          <div className="output-text output-text--error">
            ❌ {error}
          </div>
        )}

        {output && (
          <>
            {output.compile_output && (
              <div className="output-text output-text--error">
                <span className="output-label">Compile Error:</span>
                <pre>{output.compile_output}</pre>
              </div>
            )}
            {output.stderr && (
              <div className="output-text output-text--error">
                <span className="output-label">Error:</span>
                <pre>{output.stderr}</pre>
              </div>
            )}
            {output.stdout && (
              <div className="output-text output-text--success">
                <pre>{output.stdout}</pre>
              </div>
            )}
            {!output.stdout && !output.stderr && !output.compile_output && (
              <div className="output-text output-text--muted">
                No output produced.
              </div>
            )}
          </>
        )}

        {!isRunning && !output && !error && (
          <div className="output-empty">
            <span>Click "Run" to execute your code</span>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
