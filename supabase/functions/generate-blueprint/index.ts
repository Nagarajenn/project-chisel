const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intent, artifacts } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from artifacts
    const artifactContext = artifacts.map((a: any) => 
      `Artifact: ${a.name} (${a.type})\nRelevance: ${a.relevance}%\nReason: ${a.reason}`
    ).join("\n\n");

    const systemPrompt = `You are an AI assistant that generates detailed technical blueprints for software projects based on historical project artifacts.

Your task is to create a comprehensive blueprint with the following sections:
1. Overview - Project summary and approach
2. Data Sources - Data requirements and integration points
3. ETL Pipeline - Data processing architecture
4. Code Templates - Implementation examples with actual code
5. Monitoring - Metrics, dashboards, and alerts

Be specific, technical, and actionable. Include code examples where relevant.`;

    const userPrompt = `Based on the following user intent and historical artifacts, generate a detailed technical blueprint:

USER INTENT:
${intent}

RELEVANT HISTORICAL ARTIFACTS:
${artifactContext}

Generate a comprehensive blueprint in JSON format with these keys: overview, data, etl, code, monitoring`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate blueprint");
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Try to parse as JSON, fallback to structured text
    let blueprint;
    try {
      blueprint = JSON.parse(generatedText);
    } catch {
      // If not JSON, structure the response
      blueprint = {
        overview: generatedText.substring(0, 500),
        data: "Generated from AI response",
        etl: "Generated from AI response",
        code: "Generated from AI response",
        monitoring: "Generated from AI response",
      };
    }

    return new Response(JSON.stringify({ blueprint }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-blueprint:", error);
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
