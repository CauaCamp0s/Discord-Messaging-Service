import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const message = formData.get("message") as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Arquivo é obrigatório" },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Mensagem é obrigatória" },
        { status: 400 }
      )
    }

    const uploadFormData = new FormData()
    uploadFormData.append("file", file)
    uploadFormData.append("message", message)

    const response = await fetch(`${API_BASE_URL}/send-bulk`, {
      method: "POST",
      body: uploadFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Erro ao processar arquivo",
      }))
      throw new Error(errorData.message || "Erro ao processar arquivo")
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: data.message || "Arquivo processado com sucesso",
      results: data.results,
    })
  } catch (error) {
    console.error("[API] Error processing bulk message:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro ao processar arquivo",
      },
      { status: 500 }
    )
  }
}

