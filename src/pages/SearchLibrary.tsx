import { useState } from "react";
import { Search, Filter, TrendingUp, Clock, CheckCircle2, Code2, Database, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockProjects = [
  {
    id: 1,
    title: "Invoice Reconciliation Pipeline",
    description: "Automated invoice processing with ML-based matching",
    type: "Pipeline",
    tags: ["Python", "ML", "ETL"],
    successScore: 95,
    lastUsed: "2 weeks ago",
    artifacts: ["Code", "Dashboard", "Documentation"],
  },
  {
    id: 2,
    title: "Customer Churn Prediction Model",
    description: "Predictive model for customer retention analysis",
    type: "Model",
    tags: ["Python", "TensorFlow", "Analytics"],
    successScore: 88,
    lastUsed: "1 month ago",
    artifacts: ["Code", "Slides", "Model"],
  },
  {
    id: 3,
    title: "Real-time Data Ingestion System",
    description: "Streaming data pipeline for IoT sensors",
    type: "Infrastructure",
    tags: ["Kafka", "AWS", "Terraform"],
    successScore: 92,
    lastUsed: "3 days ago",
    artifacts: ["Code", "IaC", "Documentation"],
  },
];

const typeIcons = {
  Pipeline: Database,
  Model: TrendingUp,
  Infrastructure: Code2,
  Report: FileText,
};

export default function SearchLibrary() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Project Library</h1>
        <p className="text-muted-foreground">
          Search through historical projects, code, reports, and dashboards
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project name, client, technology, or outcome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => {
          const TypeIcon = typeIcons[project.type as keyof typeof typeIcons] || FileText;
          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base leading-tight">{project.title}</CardTitle>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-success border-success/30 bg-success/5 shrink-0">
                    {project.successScore}%
                  </Badge>
                </div>
                <CardDescription className="mt-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {project.lastUsed}
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    {project.artifacts.length} artifacts
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
