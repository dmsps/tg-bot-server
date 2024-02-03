import TelegramBot from "node-telegram-bot-api"
require("dotenv").config()

import { openaiSendQuery } from "./plugins/Openai"

const API_KEY_BOT = process.env.API_KEY_BOT

if (!API_KEY_BOT) {
    throw new Error(`Empty Bot API Key`)
}

const bot = new TelegramBot(API_KEY_BOT, {
    polling: true,
})

bot.on("polling_error", (err: any): void => console.log(err?.data?.error.message))

const botSendMessage = async (
    chatId: number,
    text: string
): Promise<TelegramBot.Message | undefined> => {
    try {
        const response = await bot.sendMessage(chatId, text)
        console.log("botSendMessage", chatId)
        return response
    } catch (error) {}
}

const botEditMessage = async (
    chatId: number,
    messageId: number,
    text: string
): Promise<boolean | TelegramBot.Message | undefined> => {
    try {
        const response = await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: messageId,
        })
        console.log("botEditMessage", chatId)
        return response
    } catch (error) {}
}

const TG_POST_BUTTON: TelegramBot.InlineKeyboardButton = {
    text: "💬 Написать рецензию о фильме",
    callback_data: "tgPost",
}

const TG_POST_MESSAGE: string = "Напишите название фильма"

bot.on("text", async (msg: TelegramBot.Message): Promise<void> => {
    if (!msg.text) {
        return
    }

    if (msg.text === TG_POST_BUTTON.text) {
        await bot.sendMessage(msg.chat.id, TG_POST_MESSAGE, {
            reply_to_message_id: msg.message_id,
        })
    } else if (msg.text == "/menu") {
        await bot.sendMessage(msg.chat.id, `Меню бота`, {
            reply_markup: {
                inline_keyboard: [[TG_POST_BUTTON]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        })
    }

    if (msg.reply_to_message?.text === TG_POST_MESSAGE) {
        const requestText = msg.text

        const msgLoading = await botSendMessage(msg.chat.id, `Бот генерирует ответ...`)
        if (!msgLoading) return
        await bot.sendChatAction(msg.chat.id, "typing")

        const responseText = await openaiSendQuery(requestText)

        await botEditMessage(
            msg.chat.id,
            msgLoading.message_id,
            responseText || "Запрос не обработан"
        )
    }
})

bot.on("callback_query", async (ctx): Promise<void> => {
    const callbackData = ctx.data

    if (callbackData === TG_POST_BUTTON.callback_data) {
        if (!ctx.message) return

        await bot.sendMessage(ctx.message.chat.id, `Напишите название фильма`, {
            reply_markup: {
                force_reply: true,
            },
        })
    }
})
