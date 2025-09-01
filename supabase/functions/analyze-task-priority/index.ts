import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { title, description, dueDate, subject } = await req.json();

    // Create a context-rich prompt for the AI
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

    console.log('Sending request to OpenAI for task analysis...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert academic assistant who analyzes tasks to determine their priority levels based on urgency, importance, and workload. Always respond with exactly one word.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 10,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const suggestedPriority = data.choices[0].message.content.trim().toLowerCase();

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
      error: 'Failed to analyze task priority',
      priority: 'medium' // fallback priority
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});