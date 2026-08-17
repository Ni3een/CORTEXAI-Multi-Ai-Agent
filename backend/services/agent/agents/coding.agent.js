import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModels.js";
import { deductCredits } from "../utils/deductCredits.js";


// ============================================================
// CLEAN JSON CONTENT
// ============================================================

const cleanJsonContent = (content) => {
  let text = String(content || "").trim();

  // Remove markdown code fences
  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```javascript\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Remove possible leading text before JSON
  const firstBrace = text.indexOf("{");

  if (firstBrace > 0) {
    text = text.slice(firstBrace);
  }

  // Remove possible trailing text after JSON
  const lastBrace = text.lastIndexOf("}");

  if (lastBrace !== -1) {
    text = text.slice(0, lastBrace + 1);
  }

  return text.trim();
};


// ============================================================
// PARSE PROJECT JSON
// ============================================================

const parseProjectJson = async (llm, rawContent) => {

  // ==========================================================
  // ATTEMPT 1
  // ==========================================================

  const cleaned = cleanJsonContent(rawContent);

  console.log("====================================");
  console.log("JSON PARSER ATTEMPT 1");
  console.log("Content length:", cleaned.length);
  console.log("====================================");

  try {
    const data = JSON.parse(cleaned);

    console.log("✅ JSON parsed successfully on attempt 1");

    return data;

  } catch (firstError) {

    console.error(
      "❌ JSON attempt 1 failed:",
      firstError.message
    );

    console.error(
      "JSON length:",
      cleaned.length
    );

    console.error(
      "Last 500 characters:",
      cleaned.slice(-500)
    );
  }


  // ==========================================================
  // ATTEMPT 2 - JSON REPAIR
  // ==========================================================

  console.log("====================================");
  console.log("🔄 STARTING JSON REPAIR");
  console.log("====================================");

  const repairPrompt = `
You are a JSON repair engine.

The previous AI coding model attempted to generate a website project,
but its JSON response was invalid, incomplete, or truncated.

Your ONLY task is to repair and complete the JSON.

DO NOT explain anything.

DO NOT use markdown.

DO NOT use code fences.

DO NOT add text before JSON.

DO NOT add text after JSON.

RETURN ONLY VALID JSON.

==================================================
REQUIRED JSON STRUCTURE
==================================================

{
  "files": [
    {
      "name": "index.html",
      "content": "..."
    },
    {
      "name": "style.css",
      "content": "..."
    },
    {
      "name": "script.js",
      "content": "..."
    }
  ]
}

==================================================
IMPORTANT JSON RULES
==================================================

1. The final response MUST start with {

2. The final response MUST end with }

3. The "files" property MUST be an array.

4. Every file MUST contain:
   - name
   - content

5. Properly escape all double quotes inside JSON strings.

6. Properly escape newline characters.

7. Properly escape backslashes.

8. Do not leave any JSON string unfinished.

9. Do not leave any JSON object unfinished.

10. Do not leave any JSON array unfinished.

11. Preserve the original HTML as much as possible.

12. Preserve the original CSS as much as possible.

13. Preserve the original JavaScript as much as possible.

14. If the previous response was truncated,
    COMPLETE the missing portion logically.

15. Make sure index.html, style.css and script.js all exist.

==================================================
PREVIOUS INVALID RESPONSE
==================================================

${cleaned}

==================================================
FINAL INSTRUCTION
==================================================

Repair the JSON and return ONLY valid JSON.
`;

  let repairRes;

  try {

    repairRes = await llm.invoke(repairPrompt);

  } catch (repairError) {

    console.error(
      "❌ JSON repair model call failed:",
      repairError
    );

    throw new Error(
      repairError?.message ||
      "JSON repair model call failed"
    );
  }


  const repairedContent = cleanJsonContent(
    repairRes?.content || ""
  );

  console.log("====================================");
  console.log("JSON REPAIR RESPONSE");
  console.log("Length:", repairedContent.length);
  console.log(
    "Finish reason:",
    repairRes?.response_metadata?.finish_reason
  );
  console.log(
    "Usage:",
    repairRes?.usage_metadata
  );
  console.log("====================================");


  // ==========================================================
  // PARSE REPAIRED JSON
  // ==========================================================

  try {

    const repairedData = JSON.parse(
      repairedContent
    );

    console.log(
      "✅ JSON parsed successfully on attempt 2"
    );

    return repairedData;

  } catch (secondError) {

    console.error(
      "❌ JSON attempt 2 failed:",
      secondError.message
    );

    console.error(
      "Repaired response length:",
      repairedContent.length
    );

    console.error(
      "Last 1000 characters:",
      repairedContent.slice(-1000)
    );

    throw new Error(
      `Coding model returned invalid JSON after 2 attempts: ${secondError.message}`
    );
  }
};


// ============================================================
// VALIDATE PROJECT FILES
// ============================================================

const validateProjectFiles = (data) => {

  if (!data) {
    throw new Error(
      "Coding agent returned empty data."
    );
  }

  if (!Array.isArray(data.files)) {
    throw new Error(
      "Coding agent did not return a files array."
    );
  }

  const files = data.files.filter(
    (file) =>
      file &&
      typeof file.name === "string" &&
      typeof file.content === "string"
  );

  if (files.length === 0) {
    throw new Error(
      "No valid project files were generated."
    );
  }


  // ==========================================================
  // REQUIRED FILES
  // ==========================================================

  const hasHtml = files.some(
    (file) =>
      file.name === "index.html"
  );

  const hasCss = files.some(
    (file) =>
      file.name === "style.css"
  );

  const hasJs = files.some(
    (file) =>
      file.name === "script.js"
  );


  if (!hasHtml) {
    throw new Error(
      "Generated project is missing index.html."
    );
  }

  if (!hasCss) {
    throw new Error(
      "Generated project is missing style.css."
    );
  }

  if (!hasJs) {
    throw new Error(
      "Generated project is missing script.js."
    );
  }


  return files;
};


// ============================================================
// CODING AGENT
// ============================================================

export const codingAgent = async (state) => {

  try {

    console.log("====================================");
    console.log("🚀 CODING AGENT STARTED");
    console.log("User:", state.userId);
    console.log("Prompt:", state.prompt);
    console.log("====================================");


    // ========================================================
    // AGENT LIMIT
    // ========================================================

    await checkAgentLimit(
      state.userId,
      "coding"
    );


    // ========================================================
    // MODELS
    // ========================================================

    const intentLlm = await getModel(
      "intent"
    );

    const llm = await getModel(
      "coding"
    );


    // ========================================================
    // INTENT CLASSIFICATION
    // ========================================================

    console.log(
      "🔎 Classifying coding intent..."
    );

    const intentRes = await intentLlm.invoke(`
You are an intent classifier.

Return ONLY ONE value.

Allowed values:

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:

${state.prompt}
`);


    const intent = String(
      intentRes?.content || ""
    )
      .trim()
      .replace(/["']/g, "")
      .split(/\s+/)[0]
      .toUpperCase();


    console.log(
      "Coding intent:",
      intent
    );


    // ========================================================
    // CODE GENERATION
    // ========================================================

    if (intent === "CODE_GENERATION") {

      console.log(
        "🧑‍💻 CODE_GENERATION mode"
      );


      // ======================================================
      // CODING PROMPT
      // ======================================================

      const prompt = `
You are CortexAI Coding Agent.

Generate the requested project.

==================================================
DEFAULT STACK
==================================================

Use:

- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if the user explicitly requests it.

==================================================
PREVIEW ARCHITECTURE
==================================================

The generated project will be previewed inside
a sandboxed iframe.

The frontend automatically injects:

- style.css into a <style> tag
- script.js into a <script> tag

Therefore index.html MUST NOT load these files itself.

NEVER generate:

<script src="./script.js"></script>
<script src="/script.js"></script>
<script src="script.js"></script>

<script src="./app.js"></script>
<script src="/app.js"></script>
<script src="app.js"></script>

NEVER include:

- React CDN
- ReactDOM CDN
- Babel CDN
- Vite
- Webpack
- external JavaScript bundles
- external CSS files
- <link rel="stylesheet" href="style.css">
- <link rel="stylesheet" href="./style.css">

Do NOT use external JavaScript libraries
unless explicitly requested.

==================================================
HTML REQUIREMENTS
==================================================

index.html must contain ONLY:

- HTML structure
- HTML content

Do NOT put:

- JavaScript
- CSS

inside index.html.

Do NOT reference:

- script.js
- style.css
- app.js

from index.html.

==================================================
CSS REQUIREMENTS
==================================================

Put ALL styling inside style.css.

Use:

- CSS variables
- Flexbox
- CSS Grid
- responsive design
- smooth transitions
- hover effects
- modern spacing
- accessible contrast

==================================================
JAVASCRIPT REQUIREMENTS
==================================================

Put ALL JavaScript inside script.js.

JavaScript must work when inserted directly
into the page after HTML.

Do NOT use:

- import
- export
- require
- module scripts
- bundler-specific code

Use normal browser JavaScript.

==================================================
IMAGES
==================================================

Use real Unsplash image URLs when images are required.

Do not use placeholders.

External image URLs are allowed.

External CSS and JavaScript are NOT allowed.

==================================================
PROJECT STRUCTURE
==================================================

For normal HTML projects return exactly:

{
  "files": [
    {
      "name": "index.html",
      "content": "..."
    },
    {
      "name": "style.css",
      "content": "..."
    },
    {
      "name": "script.js",
      "content": "..."
    }
  ]
}

==================================================
QUALITY RULES
==================================================

The project must be:

- Responsive
- Modern
- Beautiful
- Semantic
- Functional
- Accessible
- Mobile friendly

Use:

- CSS variables
- Flexbox
- CSS Grid
- Smooth scrolling
- Hover effects
- Functional interactions

Avoid:

- broken selectors
- missing element references
- broken JavaScript
- external JS dependencies
- external CSS dependencies

==================================================
JSON OUTPUT
==================================================

Return ONLY valid JSON.

The response MUST:

- start with {
- end with }
- contain no markdown
- contain no code fences
- contain no explanation
- contain no extra text

==================================================
CRITICAL JSON RULES
==================================================

Properly escape:

- double quotes
- newlines
- backslashes
- HTML attributes
- JavaScript strings

Every JSON string MUST be closed.

Every JSON object MUST be closed.

Every JSON array MUST be closed.

DO NOT truncate any file.

Before returning, internally verify:

1. index.html exists
2. style.css exists
3. script.js exists
4. index.html does NOT reference script.js
5. index.html does NOT reference app.js
6. index.html does NOT reference style.css
7. index.html does NOT load React
8. index.html does NOT load ReactDOM
9. index.html does NOT load Babel
10. script.js uses normal browser JavaScript
11. style.css contains all styling
12. JSON is complete and valid

==================================================
USER REQUEST
==================================================

${state.prompt}
`;


      // ======================================================
      // CODING MODEL CALL
      // ======================================================

      console.log(
        "🤖 Calling coding model..."
      );

      const res = await llm.invoke(
        prompt
      );


      // ======================================================
      // RESPONSE DEBUGGING
      // ======================================================

      const rawContent = String(
        res?.content || ""
      );

      console.log(
        "===================================="
      );

      console.log(
        "========== CODING RESPONSE =========="
      );

      console.log(
        "Length:",
        rawContent.length
      );

      console.log(
        "Finish reason:",
        res?.response_metadata?.finish_reason
      );

      console.log(
        "Usage:",
        res?.usage_metadata
      );

      console.log(
        "===================================="
      );


      // ======================================================
      // EMPTY RESPONSE CHECK
      // ======================================================

      if (!rawContent) {

        throw new Error(
          "Coding model returned an empty response."
        );
      }


      // ======================================================
      // 2-ATTEMPT JSON PARSER
      // ======================================================

      const data = await parseProjectJson(
        llm,
        rawContent
      );


      // ======================================================
      // VALIDATE PROJECT
      // ======================================================

      const files = validateProjectFiles(
        data
      );


      // ======================================================
      // LOG FILES
      // ======================================================

      console.log(
        "===================================="
      );

      console.log(
        "✅ PROJECT GENERATED"
      );

      console.log(
        "Files:",
        files.map(
          (file) => file.name
        )
      );

      console.log(
        "===================================="
      );


      // ======================================================
      // DEDUCT CREDITS
      // ======================================================

      await deductCredits(
        state.userId,
        "coding"
      );


      // ======================================================
      // RETURN ARTIFACT
      // ======================================================

      return {

        ...state,

        aiResponse:
          "Code Generated Successfully.",

        artifacts: [
          {
            id: Date.now(),

            type: "Project",

            files,

            title: state.prompt
          }
        ]
      };
    }


    // ========================================================
    // OTHER CODING INTENTS
    // ========================================================

    console.log(
      "📚 Non-generation coding request"
    );


    const res = await llm.invoke(`
The user's coding intent is:

${intent}

The user's request is:

${state.prompt}

Return Markdown only.

Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code

Answer the user's request accurately.
`);


    const data = String(
      res?.content || ""
    );


    await deductCredits(
      state.userId,
      "coding"
    );


    return {

      ...state,

      aiResponse: data,

      artifacts: []
    };


  } catch (error) {

    // ========================================================
    // ERROR HANDLING
    // ========================================================

    console.error(
      "===================================="
    );

    console.error(
      "❌ CODING AGENT ERROR"
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "===================================="
    );


    return {

      ...state,

      aiResponse:
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Failed to generate code",

      artifacts: []
    };
  }
};