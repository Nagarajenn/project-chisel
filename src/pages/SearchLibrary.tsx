import { useState, useEffect } from "react";
import { Plus, Upload, FileText, Code2, Presentation, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const artifactTypeIcons: Record<string, any> = {
  code: Code2,
  dashboard: FileText,
  report: FileText,
  document: File,
  presentation: Presentation,
};

export default function SearchLibrary() {
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [artifactType, setArtifactType] = useState<string>("code");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [{ data: artifactsData }, { data: projectsData }] = await Promise.all([
        supabase.from("artifacts").select("*").order("created_at", { ascending: false }),
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
      ]);

      setArtifacts(artifactsData || []);
      setProjects(projectsData || []);
      if (projectsData && projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load library");
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({ 
          name: newProjectName, 
          description: newProjectDescription,
          user_id: user!.id 
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success("Project created successfully");
      setProjects([data, ...projects]);
      setSelectedProject(data.id);
      setProjectDialogOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedProject) {
      toast.error("Please select a file and project");
      return;
    }

    try {
      setIsUploading(true);

      // Read file content
      const content = await selectedFile.text();
      
      // Process artifact via edge function
      const { data: processData, error: processError } = await supabase.functions.invoke(
        "process-artifact",
        {
          body: {
            fileName: selectedFile.name,
            fileContent: content,
            projectId: selectedProject,
            artifactType: artifactType,
          },
        }
      );

      if (processError) throw processError;

      // Upload file to storage
      const filePath = `${user?.id}/${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(filePath, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      toast.success("File uploaded and processed successfully");
      setUploadDialogOpen(false);
      setSelectedFile(null);
      fetchData();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Project Library</h1>
          <p className="text-muted-foreground">
            Browse and manage your historical project artifacts
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a project to organize your artifacts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Invoice Processing System"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description (Optional)</Label>
                  <Input
                    id="project-description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Automated invoice reconciliation"
                  />
                </div>
                <Button onClick={createProject} className="w-full">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Artifact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Project Artifact</DialogTitle>
                <DialogDescription>
                  Upload code, documents, or other project files
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-select">Project</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artifact-type">Artifact Type</Label>
                  <Select value={artifactType} onValueChange={setArtifactType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file-upload">File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".txt,.md,.pdf,.docx,.pptx,.csv,.json,.py,.js,.ts,.tsx,.jsx"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported: TXT, MD, PDF, DOCX, PPTX, CSV, JSON, code files
                  </p>
                </div>
                <Button
                  onClick={handleFileUpload}
                  disabled={isUploading || !selectedFile}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload & Process"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {artifacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No artifacts yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your first project artifact to get started
            </p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Artifact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artifacts.map((artifact) => {
            const Icon = artifactTypeIcons[artifact.type] || FileText;
            return (
              <Card key={artifact.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{artifact.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {artifact.type}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {artifact.tags && artifact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {artifact.tags.slice(0, 3).map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {artifact.success_score && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Success Score:</span>
                        <Badge variant="outline" className="text-success border-success/30 bg-success/5">
                          {artifact.success_score}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
