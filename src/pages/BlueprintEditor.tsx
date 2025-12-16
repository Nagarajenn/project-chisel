import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FileEdit, Save, Eye, Code2, Database, LineChart, Settings, History, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const blueprintSections = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "data", label: "Data Sources", icon: Database },
  { id: "etl", label: "ETL Pipeline", icon: Settings },
  { id: "code", label: "Code Templates", icon: Code2 },
  { id: "monitoring", label: "Monitoring", icon: LineChart },
];

interface BlueprintVersion {
  id: string;
  version_number: number;
  content_json: Record<string, string>;
  created_at: string;
  change_summary: string | null;
}

interface Project {
  id: string;
  name: string;
}

export default function BlueprintEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const blueprintId = searchParams.get("id");
  const { artifacts = [], intent = "" } = (location.state as any) || {};
  
  const [activeSection, setActiveSection] = useState("overview");
  const [title, setTitle] = useState("New Blueprint");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [versions, setVersions] = useState<BlueprintVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState({
    overview: "",
    data: "",
    etl: "",
    code: "",
    monitoring: "",
  });

  // Load projects for the selector
  useEffect(() => {
    if (!user) return;
    
    const loadProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");
      
      if (error) {
        console.error("Error loading projects:", error);
      } else {
        setProjects(data || []);
      }
    };
    
    loadProjects();
  }, [user]);

  // Load existing blueprint or generate from artifacts
  useEffect(() => {
    if (!user) return;
    
    const loadBlueprint = async () => {
      setIsLoading(true);
      
      if (blueprintId) {
        // Load existing blueprint
        const { data: blueprint, error } = await supabase
          .from("blueprints")
          .select("*")
          .eq("id", blueprintId)
          .maybeSingle();
        
        if (error) {
          toast.error("Failed to load blueprint");
          console.error(error);
          setIsLoading(false);
          return;
        }
        
        if (blueprint) {
          setTitle(blueprint.title);
          setSelectedProjectId(blueprint.project_id);
          const contentJson = blueprint.content_json as Record<string, string>;
          setContent({
            overview: contentJson.overview || "",
            data: contentJson.data || "",
            etl: contentJson.etl || "",
            code: contentJson.code || "",
            monitoring: contentJson.monitoring || "",
          });
          
          // Load versions
          const { data: versionData } = await supabase
            .from("blueprint_versions")
            .select("*")
            .eq("blueprint_id", blueprintId)
            .order("version_number", { ascending: false });
          
          if (versionData && versionData.length > 0) {
            setVersions(versionData.map(v => ({
              ...v,
              content_json: v.content_json as Record<string, string>
            })));
            setCurrentVersion(versionData[0].version_number);
          }
        }
      } else if (artifacts.length > 0) {
        // Generate from artifacts
        generateContentFromArtifacts();
      } else {
        // Default content
        setContent({
          overview: "# New Blueprint\n\nDescribe your project here.",
          data: "## Data Sources\n\nList your data sources here.",
          etl: "## ETL Pipeline\n\nDescribe your data pipeline here.",
          code: "## Code Templates\n\nAdd code examples here.",
          monitoring: "## Monitoring\n\nDefine your monitoring strategy here.",
        });
      }
      
      setIsLoading(false);
    };
    
    loadBlueprint();
  }, [blueprintId, user]);

  const generateContentFromArtifacts = () => {
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

    const etl = `## ETL Pipeline Architecture\n\n### Ingestion Layer\n- Multi-format document processing\n- Real-time API connectors\n- Validation and sanitization\n\n### Transformation Layer\n- Data normalization\n- Business rule engine\n- Data quality checks\n\n### Loading Layer\n- Target system integration\n- Batch and real-time sync\n- Audit trail and versioning`;

    const code = `\`\`\`python\n# Example Pipeline\nclass DataProcessor:\n    def process(self, data):\n        validated = self.validate(data)\n        transformed = self.transform(validated)\n        return self.load(transformed)\n\`\`\``;

    const monitoring = `## Monitoring & Observability\n\n### Key Metrics\n- Processing Success Rate: Target > 99%\n- Average Processing Time: < 30 seconds\n- Error Rate: < 1%\n\n### Alerts\n- Processing failures: Immediate alert\n- Performance degradation: Warning at 60s`;

    setContent({ overview, data: dataSources, etl, code, monitoring });
    if (intent) {
      setTitle(intent.slice(0, 50) || "New Blueprint");
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save blueprints");
      return;
    }

    setIsSaving(true);
    
    try {
      const contentJson = content;
      const artifactIds = artifacts.map((a: any) => a.id).filter(Boolean);
      
      if (blueprintId) {
        // Update existing blueprint
        const { error: updateError } = await supabase
          .from("blueprints")
          .update({
            title,
            content_json: contentJson,
            project_id: selectedProjectId,
            artifact_ids: artifactIds.length > 0 ? artifactIds : null,
            intent: intent || null,
          })
          .eq("id", blueprintId);
        
        if (updateError) throw updateError;
        
        // Create new version
        const newVersionNumber = currentVersion + 1;
        const { error: versionError } = await supabase
          .from("blueprint_versions")
          .insert({
            blueprint_id: blueprintId,
            version_number: newVersionNumber,
            content_json: contentJson,
            created_by: user.id,
            change_summary: `Updated ${new Date().toLocaleDateString()}`,
          });
        
        if (versionError) throw versionError;
        
        setCurrentVersion(newVersionNumber);
        toast.success(`Blueprint saved (v${newVersionNumber})`);
        
        // Reload versions
        const { data: versionData } = await supabase
          .from("blueprint_versions")
          .select("*")
          .eq("blueprint_id", blueprintId)
          .order("version_number", { ascending: false });
        
        if (versionData) {
          setVersions(versionData.map(v => ({
            ...v,
            content_json: v.content_json as Record<string, string>
          })));
        }
      } else {
        // Create new blueprint
        const { data: newBlueprint, error: createError } = await supabase
          .from("blueprints")
          .insert({
            title,
            content_json: contentJson,
            user_id: user.id,
            project_id: selectedProjectId,
            artifact_ids: artifactIds.length > 0 ? artifactIds : null,
            intent: intent || null,
          })
          .select()
          .single();
        
        if (createError) throw createError;
        
        // Create initial version
        await supabase
          .from("blueprint_versions")
          .insert({
            blueprint_id: newBlueprint.id,
            version_number: 1,
            content_json: contentJson,
            created_by: user.id,
            change_summary: "Initial version",
          });
        
        toast.success("Blueprint created successfully");
        navigate(`/blueprint-editor?id=${newBlueprint.id}`, { replace: true });
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save blueprint");
    } finally {
      setIsSaving(false);
    }
  };

  const restoreVersion = (version: BlueprintVersion) => {
    setContent({
      overview: version.content_json.overview || "",
      data: version.content_json.data || "",
      etl: version.content_json.etl || "",
      code: version.content_json.code || "",
      monitoring: version.content_json.monitoring || "",
    });
    toast.info(`Restored version ${version.version_number}. Save to create a new version.`);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading blueprint...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1 flex-1 mr-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0"
            placeholder="Blueprint title"
          />
          <p className="text-muted-foreground">
            {blueprintId ? `Version ${currentVersion}` : "New blueprint"} 
            {artifacts.length > 0 && ` • Generated from ${artifacts.length} artifact${artifacts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {versions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <History className="h-4 w-4" />
                  History
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {versions.map((version) => (
                  <DropdownMenuItem
                    key={version.id}
                    onClick={() => restoreVersion(version)}
                    className="flex flex-col items-start"
                  >
                    <span className="font-medium">Version {version.version_number}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(version.created_at).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Blueprint"}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-64">
          <Label htmlFor="project">Project (optional)</Label>
          <Select value={selectedProjectId || ""} onValueChange={(v) => setSelectedProjectId(v || null)}>
            <SelectTrigger id="project">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No project</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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