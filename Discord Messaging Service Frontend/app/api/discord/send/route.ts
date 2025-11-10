import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usernameOrId, message } = body

    if (!usernameOrId || !message) {
      return NextResponse.json(
        { success: false, message: "Username/ID e mensagem são obrigatórios" },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernameOrId: usernameOrId,
        message: message,
      }),
    })

    if (!response.ok) {
      let errorData: any
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: "Erro ao enviar mensagem para o Discord" }
      }
      
      // NestJS retorna { message: "..." } ou { statusCode: 400, message: "..." }
      const errorMessage = errorData.message || errorData.error || "Erro ao enviar mensagem"
      throw new Error(errorMessage)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: data.message || "Mensagem enviada com sucesso",
      data: {
        id: crypto.randomUUID(),
        usernameOrId,
        username: data.username || (usernameOrId && !/^\d{17,19}$/.test(usernameOrId.trim()) ? usernameOrId.trim() : undefined),
        userId: data.userId || (usernameOrId && /^\d{17,19}$/.test(usernameOrId.trim()) ? usernameOrId.trim() : undefined),
        message,
        timestamp: new Date().toISOString(),
        status: "success",
      },
    })
  } catch (error) {
    console.error("[API] Error sending Discord message:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro ao enviar mensagem"
    const statusCode = errorMessage.includes("username") || errorMessage.includes("SERVER MEMBERS") ? 400 : 500
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: statusCode }
    )
  }
}
