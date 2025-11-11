import { useState } from "react";
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
  const [activeSection, setActiveSection] = useState("overview");
  const [content, setContent] = useState({
    overview: "# Invoice Reconciliation System\n\nAutomated pipeline for processing and reconciling invoices using OCR and ML-based matching.",
    data: "## Data Sources\n- PDF invoices from email attachments\n- Historical transaction data from accounting system\n- Vendor master data from ERP",
    etl: "## ETL Pipeline\n1. Email monitoring service extracts PDF attachments\n2. OCR service processes documents\n3. Data validation and cleansing\n4. ML matching algorithm\n5. Results stored in PostgreSQL",
    code: "```python\n# Example: Invoice OCR processing\nimport pytesseract\nfrom pdf2image import convert_from_path\n\ndef extract_invoice_data(pdf_path):\n    images = convert_from_path(pdf_path)\n    text = pytesseract.image_to_string(images[0])\n    return parse_invoice(text)\n```",
    monitoring: "## Monitoring & Metrics\n- Processing success rate\n- Average processing time\n- Match confidence scores\n- Error rates by type",
  });

  const handleSave = () => {
    toast.success("Blueprint saved successfully");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Blueprint Editor</h1>
          <p className="text-muted-foreground">Review and customize your generated blueprint</p>
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
