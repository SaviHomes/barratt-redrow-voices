import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface EmailTemplate {
  id?: string;
  name?: string;
  display_name: string;
  description: string;
  subject_template: string;
  html_content: string;
  variables: string[];
  category: string;
  preview_data: Record<string, string>;
}

interface TemplateEditorProps {
  open: boolean;
  template?: EmailTemplate;
  onSave: (template: Omit<EmailTemplate, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function TemplateEditor({ open, template, onSave, onCancel }: TemplateEditorProps) {
  const [formData, setFormData] = useState<Omit<EmailTemplate, 'id'>>({
    display_name: "",
    description: "",
    subject_template: "",
    html_content: "",
    variables: [],
    category: "custom",
    preview_data: {},
  });
  const [newVariable, setNewVariable] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        display_name: template.display_name,
        description: template.description,
        subject_template: template.subject_template,
        html_content: template.html_content,
        variables: template.variables || [],
        category: template.category,
        preview_data: template.preview_data || {},
      });
    } else {
      setFormData({
        display_name: "",
        description: "",
        subject_template: "",
        html_content: "",
        variables: [],
        category: "custom",
        preview_data: {},
      });
    }
  }, [template, open]);

  const detectVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
  };

  const handleContentChange = (field: 'subject_template' | 'html_content', value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      const detectedVars = [
        ...detectVariables(updated.subject_template),
        ...detectVariables(updated.html_content),
      ];
      const uniqueVars = [...new Set(detectedVars)];
      return { ...updated, variables: uniqueVars };
    });
  };

  const addVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable],
        preview_data: { ...prev.preview_data, [newVariable]: '' },
      }));
      setNewVariable("");
    }
  };

  const removeVariable = (variable: string) => {
    setFormData(prev => {
      const { [variable]: removed, ...restPreview } = prev.preview_data;
      return {
        ...prev,
        variables: prev.variables.filter(v => v !== variable),
        preview_data: restPreview,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create New Template'}</DialogTitle>
          <DialogDescription>
            Create a custom email template with variable placeholders using {`{{variableName}}`} syntax.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Welcome Email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this template"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line *</Label>
            <Input
              id="subject"
              value={formData.subject_template}
              onChange={(e) => handleContentChange('subject_template', e.target.value)}
              placeholder="Welcome to Redrow Exposed, {{userName}}!"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="html_content">HTML Content *</Label>
            <Textarea
              id="html_content"
              value={formData.html_content}
              onChange={(e) => handleContentChange('html_content', e.target.value)}
              placeholder="<p>Hi {{userName}},</p><p>Welcome to our platform!</p>"
              rows={12}
              className="font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Detected Variables</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md min-h-[50px]">
              {formData.variables.length === 0 ? (
                <span className="text-sm text-muted-foreground">No variables detected</span>
              ) : (
                formData.variables.map((variable) => (
                  <Badge key={variable} variant="secondary" className="gap-1">
                    {variable}
                    <button
                      type="button"
                      onClick={() => removeVariable(variable)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newVariable}
                onChange={(e) => setNewVariable(e.target.value)}
                placeholder="Add manual variable..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
              />
              <Button type="button" onClick={addVariable} variant="outline">
                Add
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
