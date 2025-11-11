import { Download, Github, FileText, TicketCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const exportOptions = [
  {
    id: "github",
    title: "Export to GitHub",
    description: "Create a new repository with scaffolded project code and CI/CD pipelines",
    icon: Github,
    action: () => toast.success("Repository created successfully"),
  },
  {
    id: "pptx",
    title: "Download Presentation",
    description: "Generate PowerPoint slides summarizing the blueprint and implementation plan",
    icon: FileText,
    action: () => toast.success("Presentation downloaded"),
  },
  {
    id: "jira",
    title: "Create Jira Epics",
    description: "Automatically generate project epics and stories based on blueprint sections",
    icon: TicketCheck,
    action: () => toast.success("Jira tickets created"),
  },
  {
    id: "prototype",
    title: "Deploy Prototype",
    description: "One-click deployment to staging environment for testing and validation",
    icon: ExternalLink,
    action: () => toast.success("Prototype deployed to staging"),
  },
];

export default function Export() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Export Blueprint</h1>
        <p className="text-muted-foreground">
          Choose how you want to share or implement your blueprint
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>{option.title}</CardTitle>
                </div>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={option.action} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>Recent exports from this blueprint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            No exports yet. Use the options above to get started.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
