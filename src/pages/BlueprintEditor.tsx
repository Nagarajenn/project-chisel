import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FileEdit, Save, Eye, Code2, Database, LineChart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const blueprintSections = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "data", label: "Data Sources", icon: Database },
  { id: "etl", label: "ETL Pipeline", icon: Settings },
  { id: "code", label: "Code Templates", icon: Code2 },
  { id: "monitoring", label: "Monitoring", icon: LineChart },
];

export default function BlueprintEditor() {
  const location = useLocation();
  const { artifacts = [], intent = "" } = (location.state as any) || {};
  const [activeSection, setActiveSection] = useState("overview");
  const [content, setContent] = useState({
    overview: "",
    data: "",
    etl: "",
    code: "",
    monitoring: "",
  });

  useEffect(() => {
    // Generate content based on selected artifacts
    if (artifacts.length > 0) {
      const overview = `# Project Blueprint\n\n${intent}\n\n## Selected Artifacts (${artifacts.length})\n\n${artifacts.map((a: any) => 
        `### ${a.title} (${a.relevance}% match)\n**Type:** ${a.type}\n**Reason:** ${a.reason}\n`
      ).join('\n')}`;
      
      const dataSources = `## Data Sources\n\nBased on selected artifacts:\n\n${artifacts
        .filter((a: any) => a.type === "Code")
        .map((a: any) => `### ${a.title}\n- Integration patterns available\n- Production-tested implementation\n- Includes error handling and monitoring\n`)
        .join('\n')}

### Additional Data Requirements
- Real-time data feeds
- Historical archives (3-5 years)
- Master data repositories`;

      const etl = `## ETL Pipeline Architecture\n\n### Ingestion Layer\n- Multi-format document processing (PDF, Excel, CSV, XML)\n- OCR for scanned documents using Tesseract/AWS Textract\n- Real-time API connectors\n- Validation and sanitization\n\n### Transformation Layer\n- Data normalization and standardization\n- Business rule engine\n- Reconciliation algorithms\n- Data quality checks\n\n### Loading Layer\n- Target system integration (${artifacts.map((a: any) => a.title).join(', ')})\n- Batch and real-time sync\n- Audit trail and versioning\n- Error handling and retry logic`;

      const code = `\`\`\`python\n# Example: Document Processing Pipeline\nimport pytesseract\nfrom pdf2image import convert_from_path\nimport pandas as pd\n\nclass InvoiceProcessor:\n    def __init__(self):\n        self.ocr_engine = pytesseract\n        \n    def process_document(self, pdf_path):\n        # Convert PDF to images\n        images = convert_from_path(pdf_path)\n        \n        # Extract text from images\n        text = self.ocr_engine.image_to_string(images[0])\n        \n        # Parse structured data\n        invoice_data = self.parse_invoice(text)\n        \n        # Validate and reconcile\n        return self.reconcile(invoice_data)\n        \n    def parse_invoice(self, text):\n        # ML-based field extraction\n        return {\n            'invoice_number': '',\n            'date': '',\n            'amount': 0.0,\n            'vendor': ''\n        }\n\`\`\`\n\n\`\`\`typescript\n// Frontend React Component\nimport { useState } from 'react';\n\nfunction InvoiceUpload() {\n  const [file, setFile] = useState<File | null>(null);\n  \n  const handleUpload = async () => {\n    const formData = new FormData();\n    formData.append('invoice', file);\n    \n    const response = await fetch('/api/process', {\n      method: 'POST',\n      body: formData\n    });\n    \n    const result = await response.json();\n    console.log('Processed:', result);\n  };\n  \n  return <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />;\n}\n\`\`\``;

      const monitoring = `## Monitoring & Observability\n\n### Key Metrics\n- **Processing Success Rate:** Target > 99%\n- **Average Processing Time:** < 30 seconds per document\n- **Match Confidence Score:** Average > 95%\n- **Error Rate by Type:** < 1% per category\n\n### Dashboards\n1. Real-time processing dashboard\n2. Error tracking and alerting\n3. Performance analytics\n4. Cost optimization metrics\n\n### Alerts & SLAs\n- Processing failures: Immediate alert\n- Confidence score drops: Warning threshold 90%\n- Performance degradation: > 60s processing time\n- Data quality issues: Daily summary\n\n### Logging Strategy\n- Structured logs (JSON format)\n- Centralized log aggregation (ELK/Datadog)\n- Request tracing with correlation IDs\n- Audit trail for compliance`;

      setContent({
        overview,
        data: dataSources,
        etl,
        code,
        monitoring,
      });
    } else {
      // Default content if no artifacts selected
      setContent({
        overview: "# Invoice Reconciliation System\n\nAutomated pipeline for processing and reconciling invoices using OCR and ML-based matching.",
        data: "## Data Sources\n- PDF invoices from email attachments\n- Historical transaction data from accounting system\n- Vendor master data from ERP",
        etl: "## ETL Pipeline\n1. Email monitoring service extracts PDF attachments\n2. OCR service processes documents\n3. Data validation and cleansing\n4. ML matching algorithm\n5. Results stored in PostgreSQL",
        code: "```python\n# Example: Invoice OCR processing\nimport pytesseract\nfrom pdf2image import convert_from_path\n\ndef extract_invoice_data(pdf_path):\n    images = convert_from_path(pdf_path)\n    text = pytesseract.image_to_string(images[0])\n    return parse_invoice(text)\n```",
        monitoring: "## Monitoring & Metrics\n- Processing success rate\n- Average processing time\n- Match confidence scores\n- Error rates by type",
      });
    }
  }, [artifacts, intent]);

  const handleSave = () => {
    toast.success("Blueprint saved successfully");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Blueprint Editor</h1>
          <p className="text-muted-foreground">
            {artifacts.length > 0 
              ? `Generated from ${artifacts.length} historical artifact${artifacts.length !== 1 ? 's' : ''}`
              : 'Review and customize your generated blueprint'}
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Blueprint
        </Button>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-5">
          {blueprintSections.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger key={section.id} value={section.id} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {blueprintSections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileEdit className="h-5 w-5 text-primary" />
                  {section.label}
                </CardTitle>
                <CardDescription>
                  Edit the {section.label.toLowerCase()} section of your blueprint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={content[section.id as keyof typeof content]}
                  onChange={(e) => setContent({ ...content, [section.id]: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
