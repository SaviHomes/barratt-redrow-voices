import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RestoreDialog } from "./RestoreDialog";
import { VersionComparisonDialog } from "./VersionComparisonDialog";
import { History, RotateCcw, Eye, FileDown } from "lucide-react";

interface Backup {
  id: string;
  template_id: string;
  name: string;
  display_name: string;
  subject_template: string;
  html_content: string;
  backup_reason: string;
  backup_notes?: string;
  backed_up_at: string;
  backed_up_by?: string;
  is_system: boolean;
}

interface BackupListProps {
  backups: Backup[];
  onRestore: (backupId: string, restoreAsNew: boolean) => Promise<void>;
  onExport: (backupId: string) => void;
}

export function BackupList({ backups, onRestore, onExport }: BackupListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [compareBackup, setCompareBackup] = useState<Backup | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const filteredBackups = backups.filter((backup) => {
    const matchesSearch =
      backup.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backup.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason =
      reasonFilter === "all" || backup.backup_reason === reasonFilter;
    return matchesSearch && matchesReason;
  });

  const handleRestoreClick = (backup: Backup) => {
    setSelectedBackup(backup);
    setShowRestore(true);
  };

  const handleCompareClick = (backup: Backup) => {
    setCompareBackup(backup);
    setShowComparison(true);
  };

  const getReasonBadge = (reason: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      manual: "default",
      "auto-update": "secondary",
      "auto-delete": "destructive",
    };
    return (
      <Badge variant={variants[reason] || "default"}>
        {reason.replace("-", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search backups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={reasonFilter} onValueChange={setReasonFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reasons</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="auto-update">Auto Update</SelectItem>
            <SelectItem value="auto-delete">Auto Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template</TableHead>
              <TableHead>Backup Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBackups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No backups found
                </TableCell>
              </TableRow>
            ) : (
              filteredBackups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{backup.display_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {backup.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(backup.backed_up_at), "PPp")}
                  </TableCell>
                  <TableCell>{getReasonBadge(backup.backup_reason)}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm">
                      {backup.backup_notes || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompareClick(backup)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreClick(backup)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onExport(backup.id)}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedBackup && (
        <RestoreDialog
          open={showRestore}
          onOpenChange={setShowRestore}
          backup={selectedBackup}
          onRestore={onRestore}
        />
      )}

      {compareBackup && (
        <VersionComparisonDialog
          open={showComparison}
          onOpenChange={setShowComparison}
          backup={compareBackup}
        />
      )}
    </div>
  );
}
