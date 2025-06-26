import fs from 'fs';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Replace with direct key if needed for local testing
});
const openai = new OpenAIApi(configuration);

export const handler = async (event) => {
  const memoryDir = path.join(__dirname, 'memory');
  const userFile = path.join(memoryDir, 'default_user.json');

  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir);
  }
  if (!fs.existsSync(userFile)) {
    fs.writeFileSync(userFile, '[]');
  }

  const body = JSON.parse(event.body);
  const userMessage = body.message;

  const pastLogs = JSON.parse(fs.readFileSync(userFile, 'utf8'));
  const lastEntry = pastLogs[pastLogs.length - 1];
  const today = new Date().toISOString().split('T')[0];
  const lastDate = lastEntry?.date;
  const missedYesterday =
    lastDate && new Date(today) - new Date(lastDate) > 86400000;

  let mostCommonMood = 'unknown';
  let avgSleep = 'unknown';
  let walkCount = 0;
  let lowEnergyCount = 0;
  let highStressCount = 0;

  if (pastLogs.length >= 7) {
    const last7 = pastLogs.slice(-7);
    const moodFreq = {};
    let sleepTotal = 0;

    last7.forEach(entry => {
      if (entry.mood) {
        moodFreq[entry.mood] = (moodFreq[entry.mood] || 0) + 1;
      }

      const hours = parseFloat(entry.sleep);
      if (!isNaN(hours)) sleepTotal += hours;

      if (entry.walking && entry.walking.toLowerCase().includes('yes')) {
        walkCount++;
      }

      if (entry.energy?.toLowerCase() === 'low') lowEnergyCount++;
      if (entry.stress?.toLowerCase() === 'high') highStressCount++;
    });

    mostCommonMood = Object.entries(moodFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    avgSleep = (sleepTotal / last7.length).toFixed(1);
  }

  const systemPrompt = `
You are Claire, a caring but sharp daily check-in coach for a private personal training gym. You always sound human — never robotic. Keep answers concise, observational, and warm. No emoji, no excessive enthusiasm.

${lastEntry ? `Yesterday's log: energy: ${lastEntry.energy}, mood: ${lastEntry.mood}, sleep: ${lastEntry.sleep}, stress: ${lastEntry.stress}, walking: ${lastEntry.walking}.` : 'No past data yet.'}

${pastLogs.length >= 7 ? `Trend: Mood most often '${mostCommonMood}', average sleep ${avgSleep}h, walked ${walkCount}/7 days.` : ''}

${missedYesterday ? 'User missed a check-in yesterday.' : ''}

${(lowEnergyCount >= 4 || highStressCount >= 4) ? 'Important: 4+ check-ins showed low energy or high stress. Respond with support, suggest changes if appropriate.' : ''}
`.replace(/\s+/g, ' ').trim();

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: messages,
  });

  const assistantReply = completion.data.choices[0].message.content;

  const newLog = {
    date: today,
    energy: null,
    sleep: null,
    stress: null,
    mood: null,
    food_quality: null,
    walking: null,
    curveball_response: null,
    notable_events: null,
    claire_feedback: assistantReply,
  };

  pastLogs.push(newLog);
  fs.writeFileSync(userFile, JSON.stringify(pastLogs, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({ reply: assistantReply }),
  };
};
