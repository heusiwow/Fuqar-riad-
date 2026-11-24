import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL_TEXT = 'gemini-4-hydrogen';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
  });

  const findLocalApkPath = () => {
    const candidates = [
      path.join(__dirname, 'public', 'downloads', 'APEX.apk'),
      path.join(__dirname, 'dist', 'downloads', 'APEX.apk'),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    return null;
  };

  app.get('/api/apk-status', (_req, res) => {
    const localApk = findLocalApkPath();
    if (localApk) {
      const stat = fs.statSync(localApk);
      res.json({
        available: true,
        url: '/downloads/APEX.apk',
        sizeBytes: stat.size,
      });
      return;
    }
    const remoteUrl = (process.env.ANDROID_APK_URL || process.env.VITE_ANDROID_APK_URL || '').trim();
    if (remoteUrl) {
      res.json({
        available: true,
        url: remoteUrl,
        sizeBytes: null,
      });
      return;
    }
    res.json({
      available: false,
      url: null,
      sizeBytes: null,
    });
  });

  app.get('/downloads/APEX.apk', (_req, res) => {
    const localApk = findLocalApkPath();
    if (localApk) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="APEX.apk"');
      res.sendFile(localApk);
      return;
    }
    const remoteUrl = (process.env.ANDROID_APK_URL || process.env.VITE_ANDROID_APK_URL || '').trim();
    if (remoteUrl) {
      res.redirect(302, remoteUrl);
      return;
    }
    res.status(404).json({ error: 'APEX.apk is not uploaded yet.' });
  });

  // 1. AI Assistant Chat (Athlete or Coach, strictly grounded in supplied real context)
  app.post('/api/ai/chat', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
      return;
    }

    try {
      const {
        message,
        history = [],
        language = 'en',
        role = 'athlete',
        context = {},
      } = req.body ?? {};

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const systemInstruction = `You are the APEX AI Training Assistant for a ${role === 'coach' ? 'professional strength & conditioning coach' : 'resistance-training athlete'}.
Respond in ${
        language === 'ar'
          ? 'authentic, professional modern Arabic sports-science and strength-training terminology (e.g., جولات، تكرارات، حجم تدريبي، استشفاء، تحكم بالحركة اللامركزية، احتياط التكرارات RIR، شدة الجهد RPE). Avoid literal awkward translations and avoid mixing English headers when Arabic fits naturally'
          : 'clear, professional English'
      }.

STRICT SCIENTIFIC & SAFETY RULES:
1. Only cite workout sessions, weights, reps, RPE/RIR, PRs, or trends that explicitly appear in the provided TRAINING_CONTEXT JSON. NEVER fabricate or hallucinate historical sessions or numbers.
2. Clearly distinguish direct observations from the logged data vs. general training assumptions or suggestions.
3. Never act as a medical doctor or diagnose injuries/medical conditions. If pain or injury is mentioned, advise consulting a qualified healthcare professional.
4. Never recommend reckless maximal lifts, dangerous volume spikes, or aggressive load jumps. If youth/young athlete status is indicated, emphasize qualified coaching supervision and technical mastery.
5. Keep RPE (1-10 perceived exertion) and RIR (Reps in Reserve) distinct and accurate; never treat them as identical metrics.
6. Format responses cleanly with short structured sections or bullet points. Keep answers practical and actionable.

TRAINING_CONTEXT:
${JSON.stringify(context).slice(0, 28000)}`;

      const recentHistory = Array.isArray(history)
        ? history.slice(-8).map((h: { role?: string; text?: string }) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: String(h.text ?? '').slice(0, 2000) }],
          }))
        : [];

      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: [
          ...recentHistory,
          { role: 'user', parts: [{ text: message.slice(0, 3000) }] },
        ],
        config: {
          systemInstruction,
        },
      });

      res.json({
        reply: response.text ?? '',
        isAiGenerated: true,
        model: MODEL_TEXT,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'AI generation failed';
      res.status(500).json({ error: msg });
    }
  });

  // 2. AI Structured Program Generator (returns editable draft mapped to catalog exercises)
  app.post('/api/ai/generate-program', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
      return;
    }

    try {
      const {
        language = 'en',
        philosophy = 'hybrid',
        experienceLevel = 'intermediate',
        daysPerWeek = 4,
        durationWeeks = 8,
        goal = 'hypertrophy',
        equipment = ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
        preferences = '',
        avoidExercises = '',
        ageGroup = 'adult',
        catalogExercises = [],
      } = req.body ?? {};

      const compactCatalog = Array.isArray(catalogExercises)
        ? catalogExercises.slice(0, 80).map((e: Record<string, unknown>) => ({
            id: e.id,
            nameEn: e.nameEn,
            nameAr: e.nameAr,
            primaryMuscles: e.primaryMuscles,
            equipment: e.equipment,
            category: e.category,
          }))
        : [];

      const philosophyRule =
        philosophy === 'old_school'
          ? 'Old School Philosophy: prioritize foundational multi-joint barbell/dumbbell compounds first, focused 45-60 min routines, mind-muscle control, classic hypertrophy reps, and disciplined logbook progression—with zero unsafe maxing out.'
          : philosophy === 'modern'
            ? 'Modern Scientific Philosophy: optimize weekly effective sets per muscle (10-16 sets/wk), 1-3 RIR autoregulation, stable mechanical-tension profiles, and fatigue-to-stimulus efficiency.'
            : 'Hybrid System: anchor workouts with foundational heavy free-weight compounds (Old School discipline) followed by stable cable/machine hypertrophy accessories managed by RIR & fatigue limits (Modern Science).';

      const prompt = `Design an editable, safe ${durationWeeks}-week resistance training program for a ${experienceLevel} athlete (${ageGroup}) training ${daysPerWeek} days per week with primary goal "${goal}" under training philosophy "${philosophy}".
${philosophyRule}
Available equipment: ${Array.isArray(equipment) ? equipment.join(', ') : 'barbell, dumbbell'}.
Preferences: ${preferences || 'balanced full-musculature development'}.
Exercises to avoid / contraindications: ${avoidExercises || 'none specified'}.
Language for titles & guidance: ${
        language === 'ar'
          ? 'Arabic — use authentic, idiomatic Arabic strength & bodybuilding terminology (e.g., جولات، تكرارات، إحماء، استشفاء، التدرج التدريبي، ديلود / تخفيف الحمل). Never translate word-for-word.'
          : 'English'
      }.

Use ONLY exerciseId values from this catalog:
${JSON.stringify(compactCatalog)}

Create ${daysPerWeek} distinct workout days (workoutDays) matching the weekly frequency, and map a 7-day schedule (dayIndex 0=Monday .. 6=Sunday) assigning each workout day to appropriate days with rest days in between. Include realistic sets (2-5), rep ranges, restSeconds (60-180), targetRpe (6.5-8.5 for general sets; moderate if beginner/youth), progressionApproach, and deloadGuidance. Keep load progression conservative and safe.`;

      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
          systemInstruction:
            'You are an evidence-based strength and conditioning program architect who respects both exercise science and classic bodybuilding fundamentals. Return strict valid JSON matching the schema. Never prescribe reckless maximal loads or claim endorsement by external organizations.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              splitType: {
                type: Type.STRING,
                enum: ['push_pull_legs', 'upper_lower', 'full_body', 'bro_split', 'custom'],
              },
              durationWeeks: { type: Type.INTEGER },
              weeklyFrequency: { type: Type.INTEGER },
              intensityGuidance: { type: Type.STRING },
              progressionApproach: { type: Type.STRING },
              deloadGuidance: { type: Type.STRING },
              safetyNote: { type: Type.STRING },
              workoutDays: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayKey: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          exerciseId: { type: Type.STRING },
                          sets: { type: Type.INTEGER },
                          targetRepsMin: { type: Type.INTEGER },
                          targetRepsMax: { type: Type.INTEGER },
                          restSeconds: { type: Type.INTEGER },
                          targetRpe: { type: Type.NUMBER },
                          notes: { type: Type.STRING },
                        },
                        required: ['exerciseId', 'sets', 'targetRepsMin', 'targetRepsMax', 'restSeconds'],
                      },
                    },
                  },
                  required: ['dayKey', 'name', 'exercises'],
                },
              },
              weeklySchedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayIndex: { type: Type.INTEGER },
                    isRestDay: { type: Type.BOOLEAN },
                    dayKey: { type: Type.STRING },
                  },
                  required: ['dayIndex', 'isRestDay'],
                },
              },
            },
            required: [
              'name',
              'splitType',
              'durationWeeks',
              'weeklyFrequency',
              'intensityGuidance',
              'progressionApproach',
              'deloadGuidance',
              'workoutDays',
              'weeklySchedule',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        draft: parsed,
        isAiGenerated: true,
        model: MODEL_TEXT,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Program generation failed';
      res.status(500).json({ error: msg });
    }
  });

  // 2B. AI Existing Program Modifier (preserves workout IDs & history, returns preview diff)
  app.post('/api/ai/modify-program', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
      return;
    }

    try {
      const {
        language = 'en',
        philosophy = 'hybrid',
        instruction = '',
        currentProgram = {},
        linkedWorkouts = [],
        catalogExercises = [],
      } = req.body ?? {};

      if (!instruction || typeof instruction !== 'string') {
        res.status(400).json({ error: 'Modification instruction is required.' });
        return;
      }

      const compactCatalog = Array.isArray(catalogExercises)
        ? catalogExercises.slice(0, 80).map((e: Record<string, unknown>) => ({
            id: e.id,
            nameEn: e.nameEn,
            nameAr: e.nameAr,
            primaryMuscles: e.primaryMuscles,
            equipment: e.equipment,
            category: e.category,
          }))
        : [];

      const prompt = `Modify the following existing APEX training program according to the user's request, without destroying unrelated structure.
User Request: "${instruction.slice(0, 1000)}"
Philosophy Lens: ${philosophy}
Language for output text: ${
        language === 'ar'
          ? 'Arabic — write all summaries, day titles, and exercise notes in fluent, natural Arabic resistance-training terminology.'
          : 'English'
      }.

CURRENT_PROGRAM:
${JSON.stringify(currentProgram).slice(0, 6000)}

LINKED_WORKOUTS:
${JSON.stringify(linkedWorkouts).slice(0, 12000)}

ALLOWED_CATALOG_EXERCISES (use ONLY exerciseId values from this list):
${JSON.stringify(compactCatalog)}

Return the modified workouts referencing the exact existing workoutId values from LINKED_WORKOUTS so existing sessions remain intact.`;

      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
          systemInstruction:
            'You are a careful coaching assistant updating an existing training plan safely. Preserve valid existing workoutId strings, only use exerciseId values from ALLOWED_CATALOG_EXERCISES, and explain your adjustments concisely.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              modifiedProgramName: { type: Type.STRING },
              durationWeeks: { type: Type.INTEGER },
              intensityGuidance: { type: Type.STRING },
              progressionApproach: { type: Type.STRING },
              deloadGuidance: { type: Type.STRING },
              workoutsToUpdate: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    workoutId: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          exerciseId: { type: Type.STRING },
                          sets: { type: Type.INTEGER },
                          targetRepsMin: { type: Type.INTEGER },
                          targetRepsMax: { type: Type.INTEGER },
                          restSeconds: { type: Type.INTEGER },
                          targetRpe: { type: Type.NUMBER },
                          notes: { type: Type.STRING },
                        },
                        required: ['exerciseId', 'sets', 'targetRepsMin', 'targetRepsMax', 'restSeconds'],
                      },
                    },
                  },
                  required: ['workoutId', 'name', 'exercises'],
                },
              },
            },
            required: ['summary', 'modifiedProgramName', 'durationWeeks', 'workoutsToUpdate'],
          },
        },
      });

      const modification = JSON.parse((response.text ?? '{}').trim());
      res.json({
        modification,
        isAiGenerated: true,
        model: MODEL_TEXT,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Program modification failed';
      res.status(500).json({ error: msg });
    }
  });

  // 3. AI Performance & Coach Athlete Report Analysis
  app.post('/api/ai/analyze-performance', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
      return;
    }

    try {
      const {
        language = 'en',
        role = 'athlete',
        athleteName = 'Athlete',
        summaryData = {},
      } = req.body ?? {};

      const prompt = `Analyze the following ACTUAL recorded training data for "${athleteName}" (viewer role: ${role}).
Output language: ${
        language === 'ar'
          ? 'Arabic — use clear, natural, professional Arabic sports-science coaching language without literal translations.'
          : 'English'
      }.

DATA:
${JSON.stringify(summaryData).slice(0, 26000)}

Rules:
- Distinguish clearly between "observedFacts" (strictly from the provided numbers/dates) and "recommendations" (practical, conservative suggestions).
- If data is sparse or empty, state that honestly instead of inventing trends.
- Include "checkInQuestions" (useful questions a coach or athlete can review during weekly check-ins).
- Never provide medical diagnoses.`;

      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              observedFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvingAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
              stableOrPlateauAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
              fatigueAndIntensityNotes: { type: Type.STRING },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              checkInQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'headline',
              'observedFacts',
              'improvingAreas',
              'stableOrPlateauAreas',
              'fatigueAndIntensityNotes',
              'recommendations',
              'checkInQuestions',
            ],
          },
        },
      });

      const analysis = JSON.parse((response.text ?? '{}').trim());
      res.json({
        analysis,
        isAiGenerated: true,
        model: MODEL_TEXT,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Performance analysis failed';
      res.status(500).json({ error: msg });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('sw.js') || filePath.endsWith('manifest.webmanifest')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else if (filePath.endsWith('.apk')) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="APEX.apk"');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/downloads/') || req.path.endsWith('.apk')) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`APEX server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
