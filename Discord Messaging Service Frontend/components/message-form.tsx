"use client"

import type React from "react"

import { useState } from "react"
import { Send, Loader2, Upload, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { SentMessage } from "@/components/sent-messages-list"

export function MessageForm() {
  const [usernameOrId, setUsernameOrId] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const [showFileModal, setShowFileModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/discord/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrId,
          message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Mensagem enviada!",
          description: "A mensagem foi enviada com sucesso.",
        })

        // Save message to localStorage
        const newMessage: SentMessage = {
          id: data.data?.id || crypto.randomUUID(),
          usernameOrId: usernameOrId.trim(),
          username: data.data?.username,
          userId: data.data?.userId,
          message: message.trim(),
          timestamp: data.data?.timestamp || new Date().toISOString(),
          status: "success",
        }

        // Get existing messages from localStorage
        const stored = localStorage.getItem("sentMessages")
        const existingMessages: SentMessage[] = stored ? JSON.parse(stored) : []
        
        // Add new message to the beginning of the array
        const updatedMessages = [newMessage, ...existingMessages]
        
        // Save to localStorage
        localStorage.setItem("sentMessages", JSON.stringify(updatedMessages))

        // Clear form
        setUsernameOrId("")
        setMessage("")

        // Trigger refresh of sent messages list
        window.dispatchEvent(new Event("messageSent"))
      } else {
        throw new Error(data.message || "Erro ao enviar mensagem")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar mensagem",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !message) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo e digite uma mensagem",
        variant: "destructive",
      })
      return
    }

    setIsBulkLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("message", message)

      const response = await fetch("/api/discord/send-bulk", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Arquivo processado!",
          description:
            data.message ||
            `Processamento concluído: ${data.results?.success || 0} enviadas, ${
              data.results?.failed || 0
            } falharam`,
        })

        // Save bulk messages to localStorage
        if (data.results && data.results.success > 0) {
          const stored = localStorage.getItem("sentMessages")
          const existingMessages: SentMessage[] = stored ? JSON.parse(stored) : []
          
          // Create messages for successful sends (we don't have individual user info, so we'll create a summary)
          const bulkMessage: SentMessage = {
            id: crypto.randomUUID(),
            usernameOrId: `Envio em massa (${data.results.success} mensagens)`,
            message: message.trim(),
            timestamp: new Date().toISOString(),
            status: "success",
          }
          
          const updatedMessages = [bulkMessage, ...existingMessages]
          localStorage.setItem("sentMessages", JSON.stringify(updatedMessages))
        }

        setSelectedFile(null)
        setMessage("")
        setShowFileModal(false)

        window.dispatchEvent(new Event("messageSent"))
      } else {
        throw new Error(data.message || "Erro ao processar arquivo")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar arquivo",
        variant: "destructive",
      })
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const extension = file.name.toLowerCase().split(".").pop()
      if (!["xlsx", "xls", "csv"].includes(extension || "")) {
        toast({
          title: "Formato inválido",
          description: "Apenas arquivos .xlsx, .xls ou .csv são permitidos",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
    }
  }

  return (
    <div className="rounded-lg bg-discord-dark-2 p-6 shadow-lg ring-1 ring-white/5">
      <div className="mb-6">
        <h2 className="text-pretty text-xl font-semibold text-white">Enviar Nova Mensagem</h2>
        <p className="mt-1 text-sm text-discord-gray">Digite o ID ou username do usuário e sua mensagem</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-medium text-discord-gray">
            ID ou Username do Discord
          </label>
          <input
            id="username"
            type="text"
            value={usernameOrId}
            onChange={(e) => setUsernameOrId(e.target.value)}
            placeholder="Ex: 123456789012345678 ou Username"
            required
            className="w-full rounded-md bg-discord-dark-1 px-4 py-3 text-white placeholder-discord-gray/50 ring-1 ring-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-discord-purple"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-medium text-discord-gray">
            Mensagem
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem aqui..."
            required
            rows={6}
            className="w-full resize-none rounded-md bg-discord-dark-1 px-4 py-3 text-white placeholder-discord-gray/50 ring-1 ring-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-discord-purple"
          />
          <p className="mt-2 text-xs text-discord-gray">{message.length} caracteres</p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => setShowFileModal(true)}
            variant="outline"
            className="flex-1 border-discord-purple/30 bg-discord-dark-1 text-discord-purple hover:bg-discord-purple/10 hover:text-white"
          >
            <Upload className="mr-2 size-4" />
            Enviar Arquivo
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-discord-purple text-white hover:bg-discord-purple/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Enviar Mensagem
              </>
            )}
          </Button>
        </div>
      </form>

      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-lg rounded-lg bg-discord-dark-2 p-6 shadow-2xl ring-1 ring-white/10">
            <button
              onClick={() => {
                setShowFileModal(false)
                setSelectedFile(null)
              }}
              className="absolute right-4 top-4 rounded-md p-1 text-discord-gray transition-colors hover:bg-discord-dark-1 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-discord-purple/10 p-3">
                <Info className="size-6 text-discord-purple" />
              </div>
              <h3 className="text-lg font-semibold text-white">Enviar Mensagens em Massa</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="file" className="mb-2 block text-sm font-medium text-discord-gray">
                  Selecione o arquivo (.xlsx, .xls ou .csv)
                </label>
                <input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="w-full rounded-md bg-discord-dark-1 px-4 py-3 text-white file:mr-4 file:rounded-md file:border-0 file:bg-discord-purple file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-discord-purple/90"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-discord-gray">
                    Arquivo selecionado: <span className="text-white">{selectedFile.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="bulk-message" className="mb-2 block text-sm font-medium text-discord-gray">
                  Mensagem
                </label>
                <textarea
                  id="bulk-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite a mensagem que será enviada para todos os usuários..."
                  required
                  rows={4}
                  className="w-full resize-none rounded-md bg-discord-dark-1 px-4 py-3 text-white placeholder-discord-gray/50 ring-1 ring-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-discord-purple"
                />
              </div>

              <div className="rounded-md bg-discord-dark-1 p-4 ring-1 ring-white/5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="size-2 rounded-full bg-discord-purple" />
                  <p className="text-sm font-medium text-white">Formato do Arquivo:</p>
                </div>
                <div className="space-y-1 text-sm text-discord-gray">
                  <p className="font-mono">
                    <span className="text-discord-purple">Coluna A1:</span> nomeUser
                  </p>
                  <p className="ml-4 text-xs">↓ Nome ou ID do primeiro usuário</p>
                  <p className="ml-4 text-xs">↓ Nome ou ID do segundo usuário</p>
                  <p className="ml-4 text-xs">↓ Nome ou ID do terceiro usuário</p>
                  <p className="ml-4 text-xs">...</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowFileModal(false)
                    setSelectedFile(null)
                  }}
                  variant="outline"
                  className="flex-1 border-discord-purple/30 bg-discord-dark-1 text-discord-purple hover:bg-discord-purple/10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={isBulkLoading || !selectedFile || !message}
                  className="flex-1 bg-discord-purple text-white hover:bg-discord-purple/90 disabled:opacity-50"
                >
                  {isBulkLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 size-4" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
