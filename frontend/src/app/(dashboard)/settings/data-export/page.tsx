'use client';

import React, { useState } from 'react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ShieldCheck, FileJson, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

export default function DataExportPage() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleExportData = async () => {
    setExporting(true);
    setSuccessMsg(null);
    try {
      const response = await apiClient.get('/data-export/pii-scrub', {
        responseType: 'blob',
      });

      // Create browser download link for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pii_anonymized_${user?.organizationId || 'export'}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccessMsg('GDPR Data Export archive downloaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to download data export archive.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-border/50 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Download className="h-8 w-8 text-primary" />
          Data Export & GDPR Compliance
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Export an anonymized, relational snapshot of your organization's data for GDPR compliance and portability.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-500/20">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Export Card */}
      <Card className="rounded-2xl border border-border/60 shadow-sm max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            PII-Scrubbed Data Snapshot
          </CardTitle>
          <CardDescription>
            Generates a complete JSON relational export with scrubbed personally identifiable information (PII).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              GDPR Article 20 Compliance
            </div>
            <p>
              This snapshot includes all organization entities, user relations, projects, and metadata. All sensitive PII fields (passwords, tokens, 2FA secrets) are automatically scrubbed or hashed.
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleExportData}
            disabled={exporting}
            className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
          >
            {exporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download Anonymized Snapshot (.json)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
