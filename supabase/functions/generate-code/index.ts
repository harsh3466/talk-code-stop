import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, language } = await req.json();

    if (!prompt || !language) {
      return new Response(
        JSON.stringify({ error: "Missing prompt or language" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageInstructions: Record<string, string> = {
      python: "Write Python code. Use proper indentation, include necessary imports, and follow PEP 8 style guidelines.",
      java: "Write Java code. Include proper class structure, access modifiers, and semicolons. Use camelCase for methods and variables.",
      cpp: "Write C++ code. Include necessary headers like <iostream>, use proper namespace declarations, and include semicolons.",
    };

    const systemPrompt = `You are an expert programmer. Generate clean, working, production-ready code based on the user's natural language description.

Language: ${language.toUpperCase()}
${languageInstructions[language] || "Write clean, working code."}

Rules:
1. ONLY output the code - no explanations, no markdown code blocks, no comments about what you're doing
2. The code must be syntactically correct and ready to run
3. Include helpful inline comments in the code itself
4. Use best practices for the language
5. If the request is ambiguous, make reasonable assumptions and write functional code`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Write ${language} code that does the following: ${prompt}` },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let code = data.choices?.[0]?.message?.content || "";
    
    // Clean up the response - remove markdown code blocks if present
    code = code.replace(/^```[\w]*\n?/gm, "").replace(/\n?```$/gm, "").trim();

    return new Response(
      JSON.stringify({ code }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-code error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
