'use client';

import { useEffect, useState, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Lock, Unlock, Copy, Check, Loader2, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { encryptText, decryptText, type FormState } from '@/app/actions';

const initialState: FormState = {
  result: null,
  error: null,
  timestamp: Date.now(),
};

function SubmitButton({ idleIcon, idleText }: { idleIcon: React.ReactNode, idleText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} variant="default">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {idleIcon}
          {idleText}
        </>
      )}
    </Button>
  );
}

function ResultDisplay({ result, onClear }: { result: string | null, onClear: () => void }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "The output text has been copied successfully.",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) return null;

  return (
    <div className="space-y-2 mt-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Label htmlFor="output">Output</Label>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={onClear}
          aria-label="Clear output"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative">
        <Textarea id="output" readOnly value={result} className="pr-12 bg-muted/50" rows={5} />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function CryptoOperation({
  action,
  initialState,
  buttonIcon,
  buttonText,
  inputLabel,
  inputPlaceholder,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initialState: FormState;
  buttonIcon: React.ReactNode;
  buttonText: string;
  inputLabel: string;
  inputPlaceholder: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [localResult, setLocalResult] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<'base64' | 'rot13' | 'caesar'>('base64');

  useEffect(() => {
    if (state.timestamp > initialState.timestamp) {
        if (state.result) {
            setLocalResult(state.result);
        }
        if (state.error) {
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: state.error,
            });
        }
    }
  }, [state, toast]);

  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formRef.current?.reset();
    setAlgorithm('base64');
    setLocalResult(null);
  }

  return (
    <form ref={formRef} action={formAction} onReset={handleReset} className="space-y-4 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="algorithm">Algorithm</Label>
            <Select name="algorithm" value={algorithm} onValueChange={(value: 'base64' | 'rot13' | 'caesar') => setAlgorithm(value)}>
                <SelectTrigger id="algorithm">
                    <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="base64">Base64</SelectItem>
                    <SelectItem value="rot13">ROT13</SelectItem>
                    <SelectItem value="caesar">Caesar Cipher</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {algorithm === 'caesar' && (
            <div className="space-y-2 animate-in fade-in duration-300">
                <Label htmlFor="shift">Shift</Label>
                <Input id="shift" name="shift" type="number" defaultValue="3" required />
            </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-input">{inputLabel}</Label>
        <Textarea
          id="text-input"
          name="text"
          placeholder={inputPlaceholder}
          required
          rows={5}
        />
      </div>
      <div className="flex gap-2">
         <SubmitButton idleIcon={buttonIcon} idleText={buttonText} />
         <Button type="reset" variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
        </Button>
      </div>
      <ResultDisplay result={localResult} onClear={() => setLocalResult(null)} />
    </form>
  );
}

export function CryptoForm() {
  return (
    <Card className="shadow-xl shadow-primary/10 border-none bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <Tabs defaultValue="encrypt" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/80">
            <TabsTrigger value="encrypt">
              <Lock className="mr-2 h-4 w-4" />
              Encrypt
            </TabsTrigger>
            <TabsTrigger value="decrypt">
              <Unlock className="mr-2 h-4 w-4" />
              Decrypt
            </TabsTrigger>
          </TabsList>
          <TabsContent value="encrypt">
            <CryptoOperation
              action={encryptText}
              initialState={initialState}
              buttonIcon={<Lock className="mr-2 h-4 w-4" />}
              buttonText="Encrypt Text"
              inputLabel="Text to Encrypt"
              inputPlaceholder="Enter your secret message here..."
            />
          </TabsContent>
          <TabsContent value="decrypt">
            <CryptoOperation
              action={decryptText}
              initialState={initialState}
              buttonIcon={<Unlock className="mr-2 h-4 w-4" />}
              buttonText="Decrypt Text"
              inputLabel="Text to Decrypt"
              inputPlaceholder="Enter the encrypted message here..."
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
