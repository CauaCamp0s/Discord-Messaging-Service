"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, User, Clock, Eye, EyeOff } from "lucide-react"
import type { SentMessage } from "@/components/sent-messages-list"
import { Button } from "@/components/ui/button"

interface MessageCardProps {
  message: SentMessage
}

export function MessageCard({ message }: MessageCardProps) {
  const isSuccess = message.status === "success"
  const [showUserId, setShowUserId] = useState(false)
  
  // Determinar o que mostrar: username se disponível, senão usernameOrId
  const displayName = message.username || message.usernameOrId
  const hasUserId = message.userId && message.userId !== message.usernameOrId

  return (
    <div className="group rounded-lg bg-discord-dark-1 p-4 ring-1 ring-white/5 transition-all hover:bg-discord-dark-1/80 hover:ring-white/10">
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
            isSuccess ? "bg-green-500/10" : "bg-red-500/10"
          }`}
        >
          {isSuccess ? <CheckCircle2 className="size-5 text-green-500" /> : <XCircle className="size-5 text-red-500" />}
        </div>

        {/* Message Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <User className="size-4 text-discord-purple" />
            <span className="font-medium text-white">{displayName}</span>
            {hasUserId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-discord-gray hover:text-white"
                onClick={() => setShowUserId(!showUserId)}
                title={showUserId ? "Ocultar ID" : "Mostrar ID"}
              >
                {showUserId ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              </Button>
            )}
            {showUserId && hasUserId && (
              <span className="text-xs text-discord-gray/70 font-mono">{message.userId}</span>
            )}
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
                isSuccess ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              }`}
            >
              {isSuccess ? "Enviado" : "Erro"}
            </span>
          </div>

          <p className="mb-3 text-pretty text-sm leading-relaxed text-discord-gray">
            {message.message.length > 150 ? `${message.message.substring(0, 150)}...` : message.message}
          </p>

          <div className="flex items-center gap-2 text-xs text-discord-gray/70">
            <Clock className="size-3" />
            <time dateTime={message.timestamp}>
              {new Date(message.timestamp).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
        </div>
      </div>
    </div>
  )
}
