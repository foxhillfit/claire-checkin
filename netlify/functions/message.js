const { OpenAI } = require("openai");

exports.handler = async function(event) {
  try {
    const { message } = JSON.parse(event.body);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID
    });

    // Poll until complete
    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      await new Promise(res => setTimeout(res, 1000));
    } while (runStatus.status !== "completed");

    const messages = await openai.beta.threads.messages.list(thread.id);
    const reply = messages.data.find(msg => msg.role === "assistant").content[0].text.value;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};