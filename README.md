# Gerador de Algoritmos com IA

Uma aplicação web React que permite aos usuários descrever suas necessidades e receber aplicações web funcionais geradas por IA (DeepSeek ou Google Gemini).

## 🚀 Funcionalidades

- **Chat com IA**: Interface conversacional para descrever suas necessidades
- **Geração Automática**: Criação de aplicações web completas baseadas em suas descrições
- **Múltiplas APIs**: Suporte para DeepSeek e Google Gemini com fallback automático
- **Armazenamento Local**: Suas aplicações são salvas localmente no navegador
- **Execução Dinâmica**: Execute as aplicações geradas em novas janelas
- **Correção de Erros**: Sistema de feedback para correção automática de problemas
- **Interface Responsiva**: Funciona em desktop e dispositivos móveis

## 🛠️ Como Usar

### 1. Configurar API
1. Clique no ícone de configurações (⚙️) no canto superior direito
2. Adicione sua chave de API do DeepSeek ou Google Gemini:
   - **DeepSeek**: Obtenha em [platform.deepseek.com](https://platform.deepseek.com/)
   - **Google Gemini**: Obtenha em [aistudio.google.com](https://aistudio.google.com/)
3. Escolha o provedor ativo na aba "Provedor Ativo"

### 2. Gerar Aplicações
1. No chat, descreva a aplicação que você quer criar
2. Exemplo: "Quero um formatador automático de referências nas normas ABNT"
3. A IA irá gerar uma aplicação completa e funcional
4. A aplicação aparecerá na sidebar "Aplicações Geradas"

### 3. Executar e Gerenciar
1. Clique em uma aplicação na sidebar para ver detalhes
2. Use o botão "Executar Aplicação" para abrir em nova janela
3. Se encontrar problemas, use a seção "Reportar Erro" para correção automática
4. Delete aplicações desnecessárias com o ícone de lixeira

## 📋 Exemplos de Aplicações

- Formatador de referências ABNT
- Calculadora de IMC
- Gerador de senhas seguras
- Conversor de unidades
- Lista de tarefas (To-Do)
- Cronômetro/Timer
- Gerador de QR Code
- Calculadora de juros
- E muito mais!

## 🔧 Tecnologias Utilizadas

- **React 18**: Framework principal
- **Vite**: Build tool e dev server
- **Tailwind CSS**: Estilização
- **shadcn/ui**: Componentes de interface
- **Lucide Icons**: Ícones
- **APIs de IA**: DeepSeek e Google Gemini

## 🚀 Instalação Local

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre no diretório
cd ai-algorithm-generator

# Instale as dependências
pnpm install

# Inicie o servidor de desenvolvimento
pnpm run dev
```

## 📝 Notas Importantes

- As aplicações são armazenadas localmente no seu navegador
- Você precisa de uma chave de API válida para usar o serviço
- As aplicações geradas são executadas em novas janelas por segurança
- O sistema tenta usar Gemini por padrão, com fallback para DeepSeek

## 🔒 Privacidade

- Suas chaves de API são armazenadas apenas localmente no seu navegador
- As aplicações geradas ficam no seu dispositivo
- Nenhum dado é enviado para servidores externos além das APIs de IA configuradas

## 🆘 Suporte

Se encontrar problemas:
1. Verifique se sua chave de API está correta
2. Tente alternar entre os provedores de IA
3. Use o sistema de correção de erros integrado
4. Limpe o cache do navegador se necessário

---

Desenvolvido com ❤️ usando React e IA

