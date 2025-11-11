import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  {
    id: 4,
    title: "Multi-Format PDF Parser",
    relevance: 82,
    type: "Code",
    reason: "Handles various PDF formats including scanned images and text-based documents",
  },
  {
    id: 5,
    title: "Accounting System Integration",
    relevance: 78,
    type: "Code",
    reason: "REST API connectors for QuickBooks and Xero with batch sync capabilities",
  },
  {
    id: 6,
    title: "Discrepancy Tracking System",
    relevance: 75,
    type: "Dashboard",
    reason: "Real-time alerts and reporting for financial mismatches",
  },
];

export default function BlueprintGenerator() {
  const navigate = useNavigate();
  const [intent, setIntent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<number[]>([]);

  const handleGenerate = async () => {
    if (!intent.trim()) {
      toast.error("Please describe what you want to build");
      return;
    }

    setIsGenerating(true);
    setSelectedEvidence([]);
    // Simulate RAG retrieval
    setTimeout(() => {
      setShowEvidence(true);
      setIsGenerating(false);
      toast.success("Found relevant artifacts from project history");
    }, 2000);
  };

  const toggleEvidence = (id: number) => {
    setSelectedEvidence(prev => 
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedEvidence.length === 0) {
      toast.error("Please select at least one artifact");
      return;
    }
    const selected = mockEvidence.filter(e => selectedEvidence.includes(e.id));
    navigate("/editor", { state: { artifacts: selected, intent } });
    toast.success(`Creating blueprint with ${selectedEvidence.length} artifacts`);
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
          <CardContent className="space-y-4">
            {mockEvidence.map((evidence) => {
              const isSelected = selectedEvidence.includes(evidence.id);
              return (
                <div
                  key={evidence.id}
                  onClick={() => toggleEvidence(evidence.id)}
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all group ${
                    isSelected 
                      ? 'border-primary bg-primary/10 shadow-sm' 
                      : 'bg-card hover:bg-accent/5 hover:border-primary/30'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 group-hover:bg-primary/20'
                  }`}>
                    {evidence.type === "Code" ? (
                      <Code2 className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
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
              );
            })}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {selectedEvidence.length} artifact{selectedEvidence.length !== 1 ? 's' : ''} selected
              </p>
              <Button onClick={handleContinue} disabled={selectedEvidence.length === 0}>
                Continue with Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
