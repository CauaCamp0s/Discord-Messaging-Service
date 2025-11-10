const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function sendMessage(usernameOrId: string, message: string) {
  const response = await fetch(`${API_BASE_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      usernameOrId,
      message,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao enviar mensagem' }))
    throw new Error(error.message || 'Erro ao enviar mensagem')
  }

  return response.json()
}

export async function sendBulkMessage(file: File, message: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('message', message)

  const response = await fetch(`${API_BASE_URL}/send-bulk`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao processar arquivo' }))
    throw new Error(error.message || 'Erro ao processar arquivo')
  }

  return response.json()
}

