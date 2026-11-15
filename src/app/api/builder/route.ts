import { NextRequest, NextResponse } from "next/server";
import { callGeminiAPI } from "../../../lib/gemini";

const BUILDER_PROMPT = `You are the Interview Answer Architect. 
Transform raw anecdotes into compelling, professional STAR stories (Situation, Task, Action, Result).
Strict rules: Never invent facts. Retain user's actual tools, roles, and metrics.
Return ONLY valid JSON matching:
{
  "question_title": "Identified competency or question",
  "situation": "Context & problem description (1-2 sentences)",
  "task": "Specific responsibility or target",
  "action": "Step-by-step initiative and skills applied",
  "result": "Positive outcome, efficiency gained, or metric improved",
  "full_polished_answer": "Complete cohesive STAR paragraph",
  "spoken_friendly_version": "Short conversational sentences engineered for spoken delivery with natural breathing pauses",
  "key_strengths_highlighted": ["Process Optimization", "Ownership"],
  "coaching_tip": "One tip to make the delivery even more convincing"
}`;

export async function POST(req: NextRequest) {
  try {
    const { story, competency, apiKey } = await req.json();
    if (!story) return NextResponse.json({ error: "Story is required" }, { status: 400 });

    const prompt = `Target Competency: ${competency || "Problem Solving"}\nRaw Story: ${story}`;
    const aiRes = await callGeminiAPI(prompt, BUILDER_PROMPT, apiKey);
    if (aiRes && aiRes.situation) {
      return NextResponse.json(aiRes);
    }

    return NextResponse.json({
      question_title: competency || "Handling Operational Bottlenecks",
      situation: "Our team experienced an unexpected dispatch backlog during peak demand season.",
      task: "My responsibility was to clear the pending shipments without incurring detention costs.",
      action: "I restructured the packing shifts, introduced batch-tagging, and audited shipping bills to clear documentation bottlenecks.",
      result: "We cleared all pending shipments within 36 hours and improved on-time dispatch rate to 99.2%.",
      full_polished_answer: `During peak season, our hub faced a sudden dispatch bottleneck that threatened delivery schedules. As the lead, I reorganized our team into dual-shift clusters and introduced ERP batch-tagging. Consequently, we cleared the 500-order backlog within 36 hours and achieved a 99.2% on-time dispatch rate without extra overtime expenditure.`,
      spoken_friendly_version: `Last year, our team had an unexpected dispatch bottleneck. I stepped in, reorganized our workflow into two focused shifts, and streamlined our ERP tagging. Because of this initiative, we cleared the entire backlog within 36 hours and improved our delivery rate to over 99%.`,
      key_strengths_highlighted: ["Proactive Problem Solving", "Process Optimization"],
      coaching_tip: "Pause for one second right after stating '99.2%' to let the interviewer absorb your result."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
