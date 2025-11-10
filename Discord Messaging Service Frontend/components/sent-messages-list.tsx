"use client"

import { useState, useEffect } from "react"
import { MessageCard } from "@/components/message-card"
import { Inbox } from "lucide-react"

export interface SentMessage {
  id: string
  usernameOrId: string
  username?: string
  userId?: string
  message: string
  timestamp: string
  status: "success" | "error"
}

export function SentMessagesList() {
  const [messages, setMessages] = useState<SentMessage[]>([])

  useEffect(() => {
    // Load messages from localStorage
    const loadMessages = () => {
      const stored = localStorage.getItem("sentMessages")
      if (stored) {
        setMessages(JSON.parse(stored))
      }
    }

    loadMessages()

    // Listen for new messages
    const handleMessageSent = () => {
      loadMessages()
    }

    window.addEventListener("messageSent", handleMessageSent)
    return () => window.removeEventListener("messageSent", handleMessageSent)
  }, [])

  // Save message to localStorage (you would call this after successful send)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("sentMessages", JSON.stringify(messages))
    }
  }, [messages])

  return (
    <div className="rounded-lg bg-discord-dark-2 p-6 shadow-lg ring-1 ring-white/5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-pretty text-xl font-semibold text-white">Mensagens Enviadas</h2>
          <p className="mt-1 text-sm text-discord-gray">Histórico de todas as mensagens enviadas</p>
        </div>
        {messages.length > 0 && (
          <span className="rounded-full bg-discord-purple px-3 py-1 text-sm font-medium text-white">
            {messages.length}
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-discord-dark-1">
            <Inbox className="size-8 text-discord-gray" />
          </div>
          <p className="text-discord-gray">Nenhuma mensagem enviada ainda</p>
          <p className="mt-1 text-sm text-discord-gray/70">As mensagens enviadas aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  )
}
