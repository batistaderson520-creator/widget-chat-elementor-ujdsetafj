import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getWidgetConfig, WidgetConfig } from '@/services/widget'
import { AdminConfigForm } from '@/components/AdminConfigForm'
import { AdminHistoryList } from '@/components/AdminHistoryList'
import { AdminEmbedCode } from '@/components/AdminEmbedCode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, History, Code, LogOut, Lock } from 'lucide-react'

export default function Admin() {
  const { isAuthenticated, signIn, signOut, user } = useAuth()
  const [email, setEmail] = useState('batistawandersonluis@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [loginError, setLoginError] = useState('')
  const [config, setConfig] = useState<WidgetConfig | null>(null)
  const [loadingConfig, setLoadingConfig] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      getWidgetConfig()
        .then(setConfig)
        .finally(() => setLoadingConfig(false))
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const { error } = await signIn(email, password)
    if (error) {
      setLoginError('Credenciais inválidas. Verifique o e-mail e a senha.')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Painel do Widget</h1>
            <p className="text-sm text-slate-500">Acesse para gerenciar seu chat no Elementor</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {loginError && <p className="text-xs text-red-500">{loginError}</p>}

            <Button type="submit" className="w-full">
              Entrar no Painel
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Painel de Controle — Chat Elementor</h1>
          <p className="text-xs text-slate-500">Logado como: {user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="config" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Elementor
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="config"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
          >
            {loadingConfig ? (
              <p className="text-sm text-slate-500">Carregando configurações...</p>
            ) : config ? (
              <AdminConfigForm config={config} onSaveSuccess={setConfig} />
            ) : (
              <p className="text-sm text-red-500">
                Não foi possível carregar o registro de configuração.
              </p>
            )}
          </TabsContent>

          <TabsContent
            value="history"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
          >
            <AdminHistoryList />
          </TabsContent>

          <TabsContent
            value="embed"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
          >
            <AdminEmbedCode />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
