import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Settings, Key, CheckCircle, XCircle } from 'lucide-react'
import aiService, { AI_PROVIDERS } from '../services/aiService.js'

export default function ApiConfig({ isOpen, onClose }) {
  const [deepseekKey, setDeepseekKey] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [currentProvider, setCurrentProvider] = useState(aiService.getCurrentProvider())

  useEffect(() => {
    // Carregar chaves existentes
    setDeepseekKey(localStorage.getItem('deepseek_api_key') || '')
    setGeminiKey(localStorage.getItem('gemini_api_key') || '')
  }, [])

  const handleSaveDeepSeek = () => {
    aiService.setApiKey('deepseek', deepseekKey)
    alert('Chave DeepSeek salva com sucesso!')
  }

  const handleSaveGemini = () => {
    aiService.setApiKey('gemini', geminiKey)
    alert('Chave Gemini salva com sucesso!')
  }

  const handleProviderChange = (provider) => {
    setCurrentProvider(provider)
    aiService.switchProvider(provider)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração de APIs
          </CardTitle>
          <CardDescription>
            Configure suas chaves de API para usar os serviços de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="keys" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="keys">Chaves de API</TabsTrigger>
              <TabsTrigger value="provider">Provedor Ativo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="keys" className="space-y-6">
              {/* DeepSeek API */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="deepseek-key">DeepSeek API Key</Label>
                  {aiService.hasApiKey('deepseek') ? (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configurada
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      Não configurada
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="deepseek-key"
                    type="password"
                    placeholder="sk-..."
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                  />
                  <Button onClick={handleSaveDeepSeek} disabled={!deepseekKey}>
                    <Key className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Obtenha sua chave em: <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">platform.deepseek.com</a>
                </p>
              </div>

              {/* Gemini API */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="gemini-key">Google Gemini API Key</Label>
                  {aiService.hasApiKey('gemini') ? (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configurada
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      Não configurada
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="gemini-key"
                    type="password"
                    placeholder="AIza..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                  <Button onClick={handleSaveGemini} disabled={!geminiKey}>
                    <Key className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Obtenha sua chave em: <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">aistudio.google.com</a>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="provider" className="space-y-4">
              <div className="space-y-3">
                <Label>Provedor de IA Ativo</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card 
                    className={`cursor-pointer transition-colors ${
                      currentProvider === AI_PROVIDERS.DEEPSEEK ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleProviderChange(AI_PROVIDERS.DEEPSEEK)}
                  >
                    <CardContent className="p-4 text-center">
                      <h3 className="font-medium">DeepSeek</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Modelo avançado de raciocínio
                      </p>
                      {aiService.hasApiKey('deepseek') ? (
                        <Badge variant="default" className="mt-2">Disponível</Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-2">Chave necessária</Badge>
                      )}
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-colors ${
                      currentProvider === AI_PROVIDERS.GEMINI ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleProviderChange(AI_PROVIDERS.GEMINI)}
                  >
                    <CardContent className="p-4 text-center">
                      <h3 className="font-medium">Google Gemini</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Modelo multimodal do Google
                      </p>
                      {aiService.hasApiKey('gemini') ? (
                        <Badge variant="default" className="mt-2">Disponível</Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-2">Chave necessária</Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <p className="text-sm text-muted-foreground">
                  Provedor atual: <strong>{currentProvider === AI_PROVIDERS.DEEPSEEK ? 'DeepSeek' : 'Google Gemini'}</strong>
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

