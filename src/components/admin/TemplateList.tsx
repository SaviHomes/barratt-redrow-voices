import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Copy, Trash2, Lock, Power, PowerOff, Send, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { QuickTestDialog } from "./QuickTestDialog";

interface EmailTemplate {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  subject_template: string;
  html_content: string;
  variables: any;
  is_active: boolean;
  is_system: boolean;
  category: string;
  created_at: string;
  preview_data: any;
}

interface TemplateListProps {
  templates: EmailTemplate[];
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: EmailTemplate) => void;
  onPreview: (template: EmailTemplate) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onBackup?: (id: string) => void;
  userEmail?: string;
}

export function TemplateList({
  templates,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onToggleActive,
  onBackup,
  userEmail,
}: TemplateListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [testTemplate, setTestTemplate] = useState<EmailTemplate | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subject Preview</TableHead>
              <TableHead>Variables</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {template.is_system && <Lock className="h-3 w-3 text-muted-foreground" />}
                    <div>
                      <div className="font-medium">{template.display_name}</div>
                      {template.description && (
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {template.category}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{template.subject_template}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(template.variables) && template.variables.slice(0, 3).map((variable: string) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {Array.isArray(template.variables) && template.variables.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.variables.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTestTemplate(template)}
                      title="Send Test Email"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPreview(template)}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(template)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onBackup && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onBackup(template.id)}
                        title="Create Backup"
                      >
                        <Database className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDuplicate(template)}
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleActive(template.id, !template.is_active)}
                      title={template.is_active ? "Deactivate" : "Activate"}
                    >
                      {template.is_active ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    {!template.is_system && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(template.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <QuickTestDialog
        open={!!testTemplate}
        template={testTemplate}
        onClose={() => setTestTemplate(null)}
        userEmail={userEmail}
      />
    </div>
  );
}
