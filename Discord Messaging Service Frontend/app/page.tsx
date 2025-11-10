import { MessageForm } from "@/components/message-form"
import { SentMessagesList } from "@/components/sent-messages-list"

export default function Home() {
  return (
    <div className="min-h-screen bg-discord-dark-1">
      {/* Header */}
      <header className="border-b border-discord-dark-2/50 bg-discord-dark-2/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-discord-purple">
              <svg className="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-balance text-2xl font-bold text-white">Discord Message Sender</h1>
              <p className="text-sm text-discord-gray">Envie mensagens diretas facilmente</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <MessageForm />
          <SentMessagesList />
        </div>
      </main>
    </div>
  )
}
