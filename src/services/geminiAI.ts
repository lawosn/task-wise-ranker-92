// Gemini AI Service for direct API calls
// You'll need to get your API key from: https://aistudio.google.com/app/apikey

// Input field for API key (temporary solution)
let storedApiKey = localStorage.getItem('gemini_api_key') || '';

export const getApiKey = () => {
  if (!storedApiKey) {
    const key = prompt('Please enter your Gemini API key (get it from https://aistudio.google.com/app/apikey):');
    if (key) {
      storedApiKey = key;
      localStorage.setItem('gemini_api_key', key);
    }
  }
  return storedApiKey;
};

export const clearApiKey = () => {
  storedApiKey = '';
  localStorage.removeItem('gemini_api_key');
};

interface GeminiRequest {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
}

const callGeminiAPI = async (prompt: string, maxTokens: number = 50): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const requestBody: GeminiRequest = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: maxTokens,
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
};

export const analyzeTaskPriority = async (
  title: string,
  description?: string,
  subject?: string,
  dueDate?: Date
): Promise<'critical' | 'high' | 'medium' | 'low' | 'none'> => {
  const prompt = `Analyze the following task and determine its priority level based on urgency, importance, and workload:

Task Details:
- Title: "${title}"
- Description: "${description || 'No description provided'}"
- Subject: "${subject || 'No subject specified'}"
- Due Date: ${dueDate ? dueDate.toLocaleDateString() : 'No due date'}
- Current Date: ${new Date().toLocaleDateString()}

Priority Levels:
- critical: Major assignments, exams, projects with tight deadlines (within 1-2 days) or high academic weight
- high: Important assignments, tests, projects due within a week or with significant impact on grades  
- medium: Regular assignments, homework with moderate deadlines (1-2 weeks)
- low: Minor tasks, practice exercises, low-stakes assignments with flexible deadlines
- none: Optional tasks, extra credit, or very low-priority items

Analyze the title and description content for these priority indicators:

HIGH PRIORITY KEYWORDS in title/description:
- "exam", "test", "quiz", "midterm", "final", "presentation"
- "project", "essay", "paper", "report", "thesis"
- "urgent", "ASAP", "important", "critical", "deadline"
- Numbers indicating length/scope: "5-page", "10 questions", "research"

MEDIUM PRIORITY KEYWORDS:
- "homework", "assignment", "worksheet", "practice"
- "review", "study", "prepare", "read"

LOW PRIORITY KEYWORDS:
- "optional", "extra credit", "bonus", "draft", "outline"
- "discussion post", "journal entry", "reflection"

WORKLOAD ESTIMATION from title/description:
- Long assignments: essays, research papers, projects (higher priority)
- Quick tasks: worksheets, discussion posts, reading (lower priority)
- Group work or presentations (often higher priority due to coordination)

Consider:
1. Time urgency (how close is the due date?)
2. Academic importance based on keywords in title/description
3. Workload estimation from title/description content
4. Subject context and typical assignment weights
5. Specific urgency language in title/description

Respond with ONLY one word: critical, high, medium, low, or none`;

  const response = await callGeminiAPI(prompt, 10);
  
  // Validate the response is one of our expected values
  const validPriorities = ['critical', 'high', 'medium', 'low', 'none'] as const;
  const suggestedPriority = response.toLowerCase() as typeof validPriorities[number];
  
  return validPriorities.includes(suggestedPriority) ? suggestedPriority : 'medium';
};

export const optimizeTitle = async (title: string, subject?: string): Promise<string> => {
  const prompt = `Optimize this task title to be more concise and effective while maintaining its meaning:

Title: "${title}"
Subject: "${subject || 'General'}"

Return only the optimized title, nothing else.`;

  return await callGeminiAPI(prompt, 50);
};

export const optimizeDescription = async (
  description: string,
  title: string,
  subject?: string
): Promise<string> => {
  const prompt = `Optimize this task description to be more concise and effective while maintaining all important information:

Description: "${description || 'No description provided'}"
Title: "${title}"
Subject: "${subject || 'General'}"

Return only the optimized description, nothing else.`;

  return await callGeminiAPI(prompt, 200);
};

export const generateDescription = async (
  title: string,
  subject?: string,
  dueDate?: Date
): Promise<string> => {
  const prompt = `Generate a helpful and concise description for this task based on the available details:

Task Details:
- Title: "${title}"
- Subject: "${subject || 'No subject specified'}"
- Due Date: ${dueDate ? dueDate.toLocaleDateString() : 'No due date'}

Create a description that:
1. Explains what needs to be done based on the title
2. Includes relevant context from the subject area
3. Mentions any time-sensitive aspects if there's a due date
4. Provides helpful details someone would need to complete this task
5. Keeps it concise but informative (2-3 sentences)

Return only the description, nothing else.`;

  return await callGeminiAPI(prompt, 150);
};