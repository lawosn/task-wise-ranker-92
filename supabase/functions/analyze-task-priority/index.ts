import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, dueDate, subject, action } = await req.json();

    if (action === 'optimize-title') {
      const prompt = `Optimize this task title to be more concise and effective while maintaining its meaning:

Title: "${title}"
Subject: "${subject || 'General'}"

Return only the optimized title, nothing else.`;

      console.log('Sending request to Gemini for title optimization...');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 50,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const optimizedTitle = data.candidates[0].content.parts[0].text.trim();

      return new Response(JSON.stringify({ optimizedTitle }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'optimize-description') {
      const prompt = `Optimize this task description to be more concise and effective while maintaining all important information:

Description: "${description || 'No description provided'}"
Title: "${title}"
Subject: "${subject || 'General'}"

Return only the optimized description, nothing else.`;

      console.log('Sending request to Gemini for description optimization...');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const optimizedDescription = data.candidates[0].content.parts[0].text.trim();

      return new Response(JSON.stringify({ optimizedDescription }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default priority analysis
    const prompt = `Analyze the following task and determine its priority level based on urgency, importance, and workload:

Task Details:
- Title: "${title}"
- Description: "${description || 'No description provided'}"
- Subject: "${subject || 'No subject specified'}"
- Due Date: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
- Current Date: ${new Date().toLocaleDateString()}

Priority Levels:
- critical: Major assignments, exams, projects with tight deadlines (within 1-2 days) or high academic weight
- high: Important assignments, tests, projects due within a week or with significant impact on grades  
- medium: Regular assignments, homework with moderate deadlines (1-2 weeks)
- low: Minor tasks, practice exercises, low-stakes assignments with flexible deadlines
- none: Optional tasks, extra credit, or very low-priority items

Consider:
1. Time urgency (how close is the due date?)
2. Academic importance (exam vs worksheet vs major project)
3. Workload estimation (essay vs quick quiz vs research paper)
4. Subject context and typical assignment weights

Respond with ONLY one word: critical, high, medium, low, or none`;

    console.log('Sending request to Gemini for task analysis...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 10,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const suggestedPriority = data.candidates[0].content.parts[0].text.trim().toLowerCase();

    console.log('AI suggested priority:', suggestedPriority);

    // Validate the response is one of our expected values
    const validPriorities = ['critical', 'high', 'medium', 'low', 'none'];
    const finalPriority = validPriorities.includes(suggestedPriority) ? suggestedPriority : 'medium';

    return new Response(JSON.stringify({ priority: finalPriority }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-task-priority function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      priority: 'medium' // fallback priority
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});