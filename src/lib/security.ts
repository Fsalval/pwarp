// Sanitiza strings eliminando HTML y scripts maliciosos
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Valida que un email tenga formato correcto
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Valida que un username sea seguro
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  return usernameRegex.test(username)
}

// Escapa HTML para prevenir XSS
export function escapeHtml(str: string): string {
  if (!str) return ''
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Sanitiza contenido de plantillas
export function sanitizeTemplateContent(content: string): string {
  if (!content) return ''
  
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
}

// Valida datos de usuario
export function validateUserData(data: {
  email?: string
  username?: string
  password?: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Email inválido')
  }
  
  if (data.username && !isValidUsername(data.username)) {
    errors.push('Username debe tener 3-30 caracteres (solo letras, números, guiones y guiones bajos)')
  }
  
  if (data.password && data.password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}