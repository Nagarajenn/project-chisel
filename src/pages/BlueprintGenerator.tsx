import { useState } from "react";
import { Sparkles, Loader2, TrendingUp, FileText, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const mockEvidence = [
  {
    id: 1,
    title: "Invoice Processing Pipeline",
    relevance: 94,
    type: "Code",
    reason: "Demonstrates ETL pattern for document ingestion and data extraction",
  },
  {
    id: 2,
    title: "OCR Integration Module",
    relevance: 89,
    type: "Code",
    reason: "Shows text extraction from scanned documents with error handling",
  },
  {
    id: 3,
    title: "Financial Reconciliation Dashboard",
    relevance: 86,
    type: "Dashboard",
    reason: "Provides visualization patterns for transaction matching and discrepancies",
  },
];

export default function BlueprintGenerator() {
  const [intent, setIntent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const handleGenerate = async () => {
    if (!intent.trim()) {
      toast.error("Please describe what you want to build");
      return;
    }

    setIsGenerating(true);
    // Simulate RAG retrieval
    setTimeout(() => {
      setShowEvidence(true);
      setIsGenerating(false);
      toast.success("Found relevant artifacts from project history");
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Generate Blueprint</h1>
        <p className="text-muted-foreground">
          Describe what you want to build and we'll find the best patterns from your organization's history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What do you want to build?
          </CardTitle>
          <CardDescription>
            Be specific about requirements, tech stack, timeline, or any constraints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Automate invoice ingestion and reconciliation with OCR, handle multi-format PDFs, integrate with accounting system, build dashboard for tracking discrepancies..."
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finding patterns...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Blueprint
                </>
              )}
            </Button>
            <div className="text-xs text-muted-foreground">
              Searches across {Math.floor(Math.random() * 50 + 150)} historical projects
            </div>
          </div>
        </CardContent>
      </Card>

      {showEvidence && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              RAG Evidence - Top Matching Artifacts
            </CardTitle>
            <CardDescription>
              These proven solutions match your requirements. Click to include in blueprint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockEvidence.map((evidence) => (
              <div
                key={evidence.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 cursor-pointer transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                  {evidence.type === "Code" ? (
                    <Code2 className="h-5 w-5 text-primary" />
                  ) : (
                    <FileText className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{evidence.title}</h4>
                    <Badge variant="outline" className="text-success border-success/30 bg-success/5">
                      {evidence.relevance}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{evidence.reason}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
