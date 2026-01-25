'use server';

/**
 * @fileOverview An AI consultant that analyzes motel data and answers questions.
 *
 * - analyzeDataWithAIConsultant - A function that handles the data analysis process.
 * - AnalyzeDataWithAIConsultantInput - The input type for the analyzeDataWithAIConsultant function.
 * - AnalyzeDataWithAIConsultantOutput - The return type for the analyzeDataWithAIConsultant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDataWithAIConsultantInputSchema = z.object({
  question: z.string().describe('The question to ask the AI consultant about the motel data.'),
  motelData: z.string().describe('The current motel data in JSON format.'),
});
export type AnalyzeDataWithAIConsultantInput = z.infer<typeof AnalyzeDataWithAIConsultantInputSchema>;

const AnalyzeDataWithAIConsultantOutputSchema = z.object({
  answer: z.string().describe('The answer from the AI consultant based on the motel data.'),
});
export type AnalyzeDataWithAIConsultantOutput = z.infer<typeof AnalyzeDataWithAIConsultantOutputSchema>;

export async function analyzeDataWithAIConsultant(input: AnalyzeDataWithAIConsultantInput): Promise<AnalyzeDataWithAIConsultantOutput> {
  return analyzeDataWithAIConsultantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDataWithAIConsultantPrompt',
  input: {schema: AnalyzeDataWithAIConsultantInputSchema},
  output: {schema: AnalyzeDataWithAIConsultantOutputSchema},
  prompt: `You are an AI consultant for a motel called Motel las Bolas.
  You are provided with the current motel data in JSON format. Analyze the data and answer the question from the motel manager.
  \n  Motel Data: {{{motelData}}}
  \n  Question: {{{question}}}
  \n  Answer: `,
});

const analyzeDataWithAIConsultantFlow = ai.defineFlow(
  {
    name: 'analyzeDataWithAIConsultantFlow',
    inputSchema: AnalyzeDataWithAIConsultantInputSchema,
    outputSchema: AnalyzeDataWithAIConsultantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
