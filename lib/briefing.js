export async function createBuyerBriefing(report) {
  if (!process.env.OPENAI_API_KEY) return null;
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
    input: `You are a cautious UK used-car buying assistant. Explain only the supplied facts; do not claim to know market value, finance, theft, write-off, recalls, or mechanical condition. Recommend an independent inspection. Keep it under 180 words. Use exactly three short paragraphs separated by blank lines: (1) a plain-English verdict, (2) MOT-history evidence, and (3) questions or next steps. Do not use headings, bullet points, or preambles such as "I can only report the supplied facts".\n\nReport: ${JSON.stringify(report)}`
  });
  return response.output_text;
}
