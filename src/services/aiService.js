// Serviço para integração com APIs de IA (DeepSeek e Gemini)

const AI_PROVIDERS = {
  DEEPSEEK: 'deepseek',
  GEMINI: 'gemini'
}

class AIService {
  constructor() {
    this.currentProvider = AI_PROVIDERS.GEMINI // Começar com Gemini como padrão
    this.apiKeys = {
      deepseek: localStorage.getItem('deepseek_api_key') || '',
      gemini: localStorage.getItem('gemini_api_key') || ''
    }
  }

  // Configurar chave da API
  setApiKey(provider, apiKey) {
    this.apiKeys[provider] = apiKey
    localStorage.setItem(`${provider}_api_key`, apiKey)
  }

  // Verificar se há chave configurada
  hasApiKey(provider = this.currentProvider) {
    return this.apiKeys[provider] && this.apiKeys[provider].length > 0
  }

  // Gerar aplicação usando DeepSeek
  async generateWithDeepSeek(prompt) {
    if (!this.hasApiKey('deepseek')) {
      throw new Error('Chave da API DeepSeek não configurada')
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKeys.deepseek}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em criar aplicações web funcionais. 
            Quando o usuário descrever uma necessidade, você deve:
            1. Criar uma aplicação HTML/CSS/JavaScript completa e funcional
            2. Retornar APENAS o código da aplicação, sem explicações
            3. A aplicação deve ser autocontida (HTML, CSS e JS em um único arquivo)
            4. Incluir todos os estilos e funcionalidades necessárias
            5. Usar design moderno e responsivo
            
            Formato de resposta esperado:
            {
              "name": "Nome da Aplicação",
              "description": "Breve descrição",
              "code": "<!DOCTYPE html>...",
              "icon": "🔧"
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      throw new Error(`Erro na API DeepSeek: ${response.status}`)
    }

    const data = await response.json()
    return this.parseAIResponse(data.choices[0].message.content)
  }

  // Gerar aplicação usando Gemini
  async generateWithGemini(prompt) {
    if (!this.hasApiKey('gemini')) {
      throw new Error('Chave da API Gemini não configurada')
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKeys.gemini}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Você é um assistente especializado em criar aplicações web funcionais. 
            Quando o usuário descrever uma necessidade, você deve:
            1. Criar uma aplicação HTML/CSS/JavaScript completa e funcional
            2. Retornar APENAS um objeto JSON válido com o código da aplicação
            3. A aplicação deve ser autocontida (HTML, CSS e JS em um único arquivo)
            4. Incluir todos os estilos e funcionalidades necessárias
            5. Usar design moderno e responsivo
            
            Formato de resposta esperado (JSON válido):
            {
              "name": "Nome da Aplicação",
              "description": "Breve descrição",
              "code": "<!DOCTYPE html>...",
              "icon": "🔧"
            }
            
            Solicitação do usuário: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${response.status}`)
    }

    const data = await response.json()
    const content = data.candidates[0].content.parts[0].text
    return this.parseAIResponse(content)
  }

  // Processar resposta da IA
  parseAIResponse(content) {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          name: parsed.name || 'Aplicação Gerada',
          description: parsed.description || 'Aplicação criada pela IA',
          code: parsed.code || '<!DOCTYPE html><html><body><h1>Erro ao gerar código</h1></body></html>',
          icon: parsed.icon || '🔧'
        }
      }
      
      // Se não conseguir extrair JSON, criar resposta padrão
      return {
        name: 'Aplicação Gerada',
        description: 'Aplicação criada pela IA',
        code: content.includes('<!DOCTYPE') ? content : `<!DOCTYPE html><html><body><pre>${content}</pre></body></html>`,
        icon: '🔧'
      }
    } catch (error) {
      console.error('Erro ao processar resposta da IA:', error)
      return {
        name: 'Erro na Geração',
        description: 'Houve um erro ao processar a resposta da IA',
        code: `<!DOCTYPE html><html><body><h1>Erro</h1><p>${content}</p></body></html>`,
        icon: '❌'
      }
    }
  }

  // Gerar aplicação (método principal)
  async generateApplication(prompt) {
    try {
      if (this.currentProvider === AI_PROVIDERS.DEEPSEEK && this.hasApiKey('deepseek')) {
        return await this.generateWithDeepSeek(prompt)
      } else if (this.currentProvider === AI_PROVIDERS.GEMINI && this.hasApiKey('gemini')) {
        return await this.generateWithGemini(prompt)
      } else {
        // Fallback: tentar Gemini primeiro, depois DeepSeek
        if (this.hasApiKey('gemini')) {
          this.currentProvider = AI_PROVIDERS.GEMINI
          return await this.generateWithGemini(prompt)
        } else if (this.hasApiKey('deepseek')) {
          this.currentProvider = AI_PROVIDERS.DEEPSEEK
          return await this.generateWithDeepSeek(prompt)
        } else {
          throw new Error('Nenhuma chave de API configurada. Configure uma chave para DeepSeek ou Gemini.')
        }
      }
    } catch (error) {
      console.error('Erro ao gerar aplicação:', error)
      throw error
    }
  }

  // Corrigir aplicação existente
  async fixApplication(appCode, errorDescription) {
    const prompt = `Corrija o seguinte código HTML/CSS/JavaScript baseado no erro reportado:

ERRO REPORTADO: ${errorDescription}

CÓDIGO ATUAL:
${appCode}

Por favor, retorne o código corrigido no mesmo formato JSON:
{
  "name": "Nome da Aplicação Corrigida",
  "description": "Descrição da correção aplicada",
  "code": "<!DOCTYPE html>...",
  "icon": "🔧"
}`

    return await this.generateApplication(prompt)
  }

  // Alternar provedor
  switchProvider(provider) {
    if (Object.values(AI_PROVIDERS).includes(provider)) {
      this.currentProvider = provider
    }
  }

  // Obter provedor atual
  getCurrentProvider() {
    return this.currentProvider
  }
}

export default new AIService()
export { AI_PROVIDERS }

