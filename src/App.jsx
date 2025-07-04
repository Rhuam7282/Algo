import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Send, Bot, User, Code, Settings, Trash2, Play, AlertTriangle, Upload, Palette } from 'lucide-react'
import ApiConfig from './components/ApiConfig.jsx'
import aiService from './services/aiService.js'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [stylePrompt, setStylePrompt] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  const [generatedApps, setGeneratedApps] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [showApiConfig, setShowApiConfig] = useState(false)
  const [errorReport, setErrorReport] = useState('')
  const [isReporting, setIsReporting] = useState(false)

  const fileInputRef = useRef(null)

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
      // Usar o serviço de IA real, passando o prompt de estilo e arquivos
      const aiResponse = await aiService.generateApplication(message, stylePrompt, attachedFiles)
      
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
      setStylePrompt('')
      setAttachedFiles([])
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

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            name: file.name,
            content: e.target.result
          })
        }
        reader.readAsText(file)
      })
    })

    Promise.all(filePromises).then(newFiles => {
      setAttachedFiles(prev => [...prev, ...newFiles])
    })
  }

  const removeAttachedFile = (fileName) => {
    setAttachedFiles(prev => prev.filter(file => file.name !== fileName))
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="container mx-auto p-4 max-w-7xl glass-container">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold mb-2 text-primary">Gerador de Algoritmos com IA</h1>
          <p className="text-lg text-secondary-foreground">
            Descreva o que você precisa e a IA criará uma aplicação personalizada para você
          </p>
          <Button 
            className="mt-4 y2k-button"
            onClick={() => setShowApiConfig(true)}
          >
            <Settings className="w-5 h-5 mr-2" />
            Configurações de API
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col glass-container">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Bot className="w-5 h-5" />
                  Chat com IA
                  <Badge variant="secondary" className="text-xs y2k-badge">
                    {aiService.getCurrentProvider() === 'deepseek' ? 'DeepSeek' : 'Gemini'}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-secondary-foreground">
                  Descreva a aplicação que você gostaria de criar
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 mb-4 p-4 border rounded-lg glass-container-inner">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Olá! Descreva a aplicação que você gostaria que eu criasse para você.</p>
                      <p className="text-sm mt-2">Exemplo: "Quero um formatador automático de referências nas normas ABNT"</p>
                      {!aiService.hasApiKey('deepseek') && !aiService.hasApiKey('gemini') && (
                        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
                          <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                          <p className="text-sm">
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
                              msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                            }`}>
                              {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`p-3 rounded-lg glass-message ${
                              msg.type === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-secondary text-secondary-foreground'
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
                          <div className="bg-secondary p-3 rounded-lg glass-message">
                            <p className="text-sm">Gerando sua aplicação...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input and Style Prompt */}
                <div className="flex flex-col gap-2">
                  <Textarea
                    placeholder="Descreva a aplicação que você quer criar..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="resize-none glass-input"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <Textarea
                      placeholder="Prompt de estilo (ex: 'cores vibrantes, elementos 3D, bolhas')"
                      value={stylePrompt}
                      onChange={(e) => setStylePrompt(e.target.value)}
                      className="resize-none glass-input flex-1"
                      rows={1}
                    />
                    <Button 
                      onClick={() => fileInputRef.current.click()} 
                      size="icon"
                      variant="outline"
                      className="y2k-button"
                      title="Anexar Arquivos"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!message.trim() || isLoading}
                      size="icon"
                      className="y2k-button"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attachedFiles.map((file, index) => (
                        <Badge key={index} variant="secondary" className="y2k-badge flex items-center gap-1">
                          {file.name}
                          <button 
                            onClick={() => removeAttachedFile(file.name)}
                            className="ml-1 text-xs text-white hover:text-red-300"
                          >
                            x
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Apps Sidebar */}
          <div>
            <Card className="h-[600px] flex flex-col glass-container">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Code className="w-5 h-5" />
                  Aplicações Geradas
                </CardTitle>
                <CardDescription className="text-secondary-foreground">
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
                          className={`cursor-pointer transition-colors hover:bg-accent glass-card ${
                            selectedApp?.id === app.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedApp(app)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-2xl">{app.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate text-primary">{app.name}</h3>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {app.description}
                                  </p>
                                  <Badge variant="secondary" className="mt-2 text-xs y2k-badge">
                                    {new Date(app.createdAt).toLocaleDateString()}
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
          <Card className="mt-6 glass-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <span className="text-2xl">{selectedApp.icon}</span>
                {selectedApp.name}
              </CardTitle>
              <CardDescription className="text-secondary-foreground">{selectedApp.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-primary">Código Gerado:</h4>
                  <pre className="bg-secondary p-4 rounded-lg text-sm overflow-x-auto max-h-60 glass-code-block">
                    <code>{selectedApp.code}</code>
                  </pre>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => executeApp(selectedApp)} className="y2k-button">
                    <Play className="w-4 h-4 mr-2" />
                    Executar Aplicação
                  </Button>
                </div>

                {/* Error Reporting */}
                <div className="border-t pt-4 border-gray-300">
                  <h4 className="font-medium mb-2 text-primary">Reportar Erro</h4>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Descreva o erro ou problema encontrado na aplicação..."
                      value={errorReport}
                      onChange={(e) => setErrorReport(e.target.value)}
                      rows={3}
                      className="glass-input"
                    />
                    <Button 
                      variant="outline" 
                      onClick={reportError}
                      disabled={!errorReport.trim() || isReporting}
                      className="y2k-button"
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

