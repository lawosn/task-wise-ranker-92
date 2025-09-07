import { useState } from 'react';
import { Settings, Key, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getApiKey, clearApiKey } from '@/services/geminiAI';
import { useToast } from '@/hooks/use-toast';

export const AISettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved locally.",
      });
      setIsOpen(false);
      setApiKey('');
    }
  };

  const handleClearApiKey = () => {
    clearApiKey();
    toast({
      title: "API Key Cleared",
      description: "Your Gemini API key has been removed.",
      variant: "destructive",
    });
  };

  const hasApiKey = !!getApiKey();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/50"
          title="AI Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 rounded-3xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Key className="w-5 h-5" />
            AI Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-card-foreground font-medium">
              Gemini API Key
            </Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="rounded-xl border-border/50"
            />
            <p className="text-sm text-muted-foreground">
              Get your free API key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Google AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClearApiKey}
              disabled={!hasApiKey}
              className="flex-1 rounded-xl border-border/50"
            >
              Clear Key
            </Button>
            <Button
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim()}
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
            >
              Save Key
            </Button>
          </div>

          {hasApiKey && (
            <div className="text-sm text-green-600 dark:text-green-400 text-center">
              ✓ API key is configured
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};