import OpenAI from "openai"
require("dotenv").config()

const API_KEY_AI = process.env.API_KEY_AI

if (!API_KEY_AI) {
    throw new Error(`Empty AI API Key`)
}

const openai = new OpenAI({
    apiKey: API_KEY_AI,
})

const createQuery = (text: string): string => {
    // const content = `Напиши краткую рецензию на фильм ${text} с интересными деталями с длиной текста не более 1024 символов с разбивкой по абзацам`
    return `Напиши краткую рецензию на фильм ${text} с интересными деталями`
}

export const openaiSendQuery = async (text: string): Promise<string | null | undefined> => {
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: [{ role: "user", content: createQuery(text) }],
        model: "gpt-4",
        // model: "gpt-3.5-turbo",
    }
    try {
        const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params)
        const responseMessage = response.choices?.[0].message?.content
        if (!responseMessage) {
            console.log("openaiSendQuery::Not found message", text, { response })
        }
        return responseMessage
    } catch (error) {
        console.log("openaiSendQuery::Error", { error })
    }
}
