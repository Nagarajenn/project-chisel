import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileContent, projectId, artifactType } = await req.json();
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Generate a simple embedding (in production, you'd use a proper embedding model)
    // For now, we'll create a mock embedding
    const mockEmbedding = Array(1536).fill(0).map(() => Math.random());

    // Extract tags from content (simple word frequency)
    const words = fileContent.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    words.forEach((word: string) => {
      if (word.length > 4) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    const tags = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    // Insert artifact into database
    const { data: artifact, error: insertError } = await supabase
      .from("artifacts")
      .insert({
        project_id: projectId,
        user_id: user.id,
        name: fileName,
        type: artifactType,
        content: fileContent.substring(0, 10000), // Limit content length
        tags: tags,
        embedding: mockEmbedding,
        success_score: Math.floor(Math.random() * 20) + 80, // Mock score 80-100
        metadata: {
          processed_at: new Date().toISOString(),
          file_size: fileContent.length,
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    // Log audit trail
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "artifact_created",
      target: artifact.id,
      details: { file_name: fileName, type: artifactType }
    });

    return new Response(JSON.stringify({ artifact }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in process-artifact:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
