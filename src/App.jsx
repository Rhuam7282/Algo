import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Send, Bot, User, Code, Settings, Trash2, Play, AlertTriangle } from 'lucide-react'
import ApiConfig from './components/ApiConfig.jsx'
import aiService from './services/aiService.js'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [generatedApps, setGeneratedApps] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [showApiConfig, setShowApiConfig] = useState(false)
  const [errorReport, setErrorReport] = useState('')
  const [isReporting, setIsReporting] = useState(false)

  // Carregar aplicações do localStorage
  useEffect(() => {
    const savedApps = localStorage.getItem('generated_apps')
    if (savedApps) {
      try {
        setGeneratedApps(JSON.parse(savedApps))
      } catch (error) {
        console.error('Erro ao carregar aplicações salvas:', error)
      }
    }
  }, [])

  // Salvar aplicações no localStorage
  useEffect(() => {
    localStorage.setItem('generated_apps', JSON.stringify(generatedApps))
  }, [generatedApps])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    // Verificar se há chave de API configurada
    if (!aiService.hasApiKey('deepseek') && !aiService.hasApiKey('gemini')) {
      setChatHistory(prev => [...prev, {
        type: 'ai',
        content: 'Para usar este serviço, você precisa configurar uma chave de API. Clique no botão de configurações para adicionar sua chave do DeepSeek ou Google Gemini.',
        timestamp: new Date()
      }])
      return
    }

    const userMessage = { type: 'user', content: message, timestamp: new Date() }
    setChatHistory(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Usar o serviço de IA real
      const aiResponse = await aiService.generateApplication(message)
      
      const aiMessage = { 
        type: 'ai', 
        content: `Aplicação "${aiResponse.name}" criada com sucesso! Você pode vê-la na sidebar e executá-la.`,
        timestamp: new Date()
      }
      
      setChatHistory(prev => [...prev, aiMessage])
      
      // Adicionar nova aplicação
      const newApp = {
        id: Date.now(),
        name: aiResponse.name,
        description: aiResponse.description,
        code: aiResponse.code,
        icon: aiResponse.icon,
        createdAt: new Date()
      }
      
      setGeneratedApps(prev => [...prev, newApp])
      
    } catch (error) {
      console.error('Erro ao gerar aplicação:', error)
      const errorMessage = { 
        type: 'ai', 
        content: `Erro ao gerar aplicação: ${error.message}. Verifique sua chave de API nas configurações.`,
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const deleteApp = (appId) => {
    setGeneratedApps(prev => prev.filter(app => app.id !== appId))
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(null)
    }
  }

  const executeApp = (app) => {
    // Abrir aplicação em nova janela
    const newWindow = window.open('', '_blank')
    newWindow.document.write(app.code)
    newWindow.document.close()
  }

  const reportError = async () => {
    if (!errorReport.trim() || !selectedApp) return

    setIsReporting(true)
    try {
      const fixedApp = await aiService.fixApplication(selectedApp.code, errorReport)
      
      // Atualizar aplicação com versão corrigida
      const updatedApps = generatedApps.map(app => 
        app.id === selectedApp.id 
          ? { ...app, code: fixedApp.code, description: fixedApp.description }
          : app
      )
      setGeneratedApps(updatedApps)
      setSelectedApp({ ...selectedApp, code: fixedApp.code, description: fixedApp.description })
      
      // Adicionar mensagem no chat
      setChatHistory(prev => [...prev, {
        type: 'ai',
        content: `Aplicação "${selectedApp.name}" foi corrigida baseada no erro reportado: "${errorReport}"`,
        timestamp: new Date()
      }])
      
      setErrorReport('')
      alert('Aplicação corrigida com sucesso!')
      
    } catch (error) {
      console.error('Erro ao corrigir aplicação:', error)
      alert(`Erro ao corrigir aplicação: ${error.message}`)
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold mb-2">Gerador de Algoritmos com IA</h1>
              <p className="text-muted-foreground">
                Descreva o que você precisa e a IA criará uma aplicação personalizada para você
              </p>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowApiConfig(true)}
              title="Configurações de API"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Chat com IA
                  <Badge variant="secondary" className="text-xs">
                    {aiService.getCurrentProvider() === 'deepseek' ? 'DeepSeek' : 'Gemini'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Descreva a aplicação que você gostaria de criar
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 mb-4 p-4 border rounded-lg">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Olá! Descreva a aplicação que você gostaria que eu criasse para você.</p>
                      <p className="text-sm mt-2">Exemplo: "Quero um formatador automático de referências nas normas ABNT"</p>
                      {!aiService.hasApiKey('deepseek') && !aiService.hasApiKey('gemini') && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            Configure uma chave de API para começar a usar o serviço
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-3 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                            }`}>
                              {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`p-3 rounded-lg ${
                              msg.type === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-secondary'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {msg.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="bg-secondary p-3 rounded-lg">
                            <p className="text-sm">Gerando sua aplicação...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Descreva a aplicação que você quer criar..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="resize-none"
                    rows={2}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!message.trim() || isLoading}
                    size="icon"
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Apps Sidebar */}
          <div>
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Aplicações Geradas
                </CardTitle>
                <CardDescription>
                  {generatedApps.length} aplicação(ões) criada(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-full">
                  {generatedApps.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma aplicação criada ainda</p>
                      <p className="text-sm mt-2">Use o chat para gerar sua primeira aplicação</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {generatedApps.map((app) => (
                        <Card 
                          key={app.id} 
                          className={`cursor-pointer transition-colors hover:bg-accent ${
                            selectedApp?.id === app.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedApp(app)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-2xl">{app.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">{app.name}</h3>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {app.description}
                                  </p>
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    {app.createdAt.toLocaleDateString()}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteApp(app.id)
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected App Details */}
        {selectedApp && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedApp.icon}</span>
                {selectedApp.name}
              </CardTitle>
              <CardDescription>{selectedApp.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Código Gerado:</h4>
                  <pre className="bg-secondary p-4 rounded-lg text-sm overflow-x-auto max-h-60">
                    <code>{selectedApp.code}</code>
                  </pre>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => executeApp(selectedApp)}>
                    <Play className="w-4 h-4 mr-2" />
                    Executar Aplicação
                  </Button>
                </div>

                {/* Error Reporting */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Reportar Erro</h4>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Descreva o erro ou problema encontrado na aplicação..."
                      value={errorReport}
                      onChange={(e) => setErrorReport(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      variant="outline" 
                      onClick={reportError}
                      disabled={!errorReport.trim() || isReporting}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {isReporting ? 'Corrigindo...' : 'Reportar e Corrigir'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* API Configuration Modal */}
      <ApiConfig 
        isOpen={showApiConfig} 
        onClose={() => setShowApiConfig(false)} 
      />
    </div>
  )
}

export default App

