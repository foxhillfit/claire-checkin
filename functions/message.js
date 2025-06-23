const { OpenAI } = require("openai");

exports.handler = async function(event) {
  const { message } = JSON.parse(event.body);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const thread = await openai.beta.threads.create();
  const assistant_id = process.env.OPENAI_ASSISTANT_ID;

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: message
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id
  });

  let runStatus;
  do {
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  } while (runStatus.status !== "completed");

  const messages = await openai.beta.threads.messages.list(thread.id);
  const reply = messages.data.find(msg => msg.role === "assistant").content[0].text.value;

  return {
    statusCode: 200,
    body: JSON.stringify({ reply })
  };
};