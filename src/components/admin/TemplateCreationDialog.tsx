import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface TemplateCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplateCreationDialog = ({ open, onOpenChange }: TemplateCreationDialogProps) => {
  const [templateName, setTemplateName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("notification");
  const [subject, setSubject] = useState("");
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState("");
  const [bodyContent, setBodyContent] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const addVariable = () => {
    if (newVariable && !variables.includes(newVariable)) {
      setVariables([...variables, newVariable]);
      setNewVariable("");
    }
  };

  const removeVariable = (variable: string) => {
    setVariables(variables.filter(v => v !== variable));
  };

  const generatePrompt = () => {
    const prompt = `Create a new email template with these specifications:

**Template Details:**
- Name (slug): ${templateName}
- Display Name: ${displayName}
- Description: ${description}
- Category: ${category}
- Subject: ${subject}

**Variables:**
${variables.map(v => `- ${v}`).join('\n')}

**Email Body Content:**
${bodyContent}

**Requirements:**
1. Create React Email components in both:
   - supabase/functions/send-admin-email/_templates/${templateName}.tsx
   - supabase/functions/sync-email-templates/_templates/${templateName}.tsx
2. Both components MUST use <EmailLayout> wrapper for header/footer
3. Update send-admin-email/index.ts to import and register the template
4. Update sync-email-templates/index.ts to import and add to templates array with preview data
5. Insert database record in email_templates table
6. Run the email template sync to update html_content

Make sure the template follows the same pattern as existing templates with proper styling and EmailLayout wrapper.`;

    return prompt;
  };

  const handleCopyPrompt = () => {
    const prompt = generatePrompt();
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Prompt copied! Paste it in the chat to create your template.");
  };

  const handleGeneratePrompt = () => {
    if (!templateName || !displayName || !subject || !bodyContent) {
      toast.error("Please fill in all required fields");
      return;
    }
    setShowPrompt(true);
  };

  const resetForm = () => {
    setTemplateName("");
    setDisplayName("");
    setDescription("");
    setCategory("notification");
    setSubject("");
    setVariables([]);
    setNewVariable("");
    setBodyContent("");
    setShowPrompt(false);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  if (showPrompt) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Specification Ready</DialogTitle>
            <DialogDescription>
              Copy this prompt and paste it in the chat. I'll automatically generate all files, update edge functions, create database records, and run the sync!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                {generatePrompt()}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={handleCopyPrompt}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Prompt
                  </>
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Close
              </Button>
              <Button onClick={handleCopyPrompt} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy & Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Email Template</DialogTitle>
          <DialogDescription>
            Fill in the details below. I'll generate all necessary files and configurations automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">
                Template Name (slug) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="templateName"
                placeholder="e.g., user-welcome"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              />
              <p className="text-xs text-muted-foreground">Lowercase, hyphen-separated</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                placeholder="e.g., User Welcome Email"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of when this template is used"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject Line <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="e.g., Welcome to Redrow Exposed!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Variables</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add variable name (e.g., userName)"
                value={newVariable}
                onChange={(e) => setNewVariable(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addVariable()}
              />
              <Button type="button" size="sm" onClick={addVariable}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {variables.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {variables.map((variable) => (
                  <Badge key={variable} variant="secondary" className="gap-1">
                    {variable}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeVariable(variable)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyContent">
              Email Body Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="bodyContent"
              placeholder="Describe the content, sections, and structure of the email body..."
              value={bodyContent}
              onChange={(e) => setBodyContent(e.target.value)}
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              Describe what should be in the email. I'll structure it with proper styling and the EmailLayout wrapper.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleGeneratePrompt} className="flex-1">
              Generate Template Specification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
