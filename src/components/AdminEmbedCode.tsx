import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, Code } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function AdminEmbedCode() {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const appUrl = window.location.origin
  const embedCode = `<iframe
  src="${appUrl}/"
  title="Chat Widget"
  style="position: fixed; bottom: 0; right: 0; width: 100%; max-width: 420px; height: 650px; border: none; background: transparent; z-index: 999999; pointer-events: none;"
  allow="transparent"
></iframe>`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    toast({
      title: 'Código copiado!',
      description: 'Cole este snippet no Elementor.',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold flex items-center">
            <Code className="h-4 w-4 mr-2 text-indigo-500" />
            Snippet Iframe para Elementor
          </span>
          <Button size="sm" onClick={handleCopy} variant="outline">
            {copied ? (
              <Check className="h-4 w-4 mr-1 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
          {embedCode}
        </pre>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Passo a Passo de Integração no Elementor:</h4>
        <ol className="list-decimal list-inside text-sm space-y-2 text-slate-600 dark:text-slate-400">
          <li>
            Abra a página desejada no editor do <strong>Elementor</strong>.
          </li>
          <li>
            Arraste o widget de <strong>HTML</strong> (ou crie um bloco de Código Personalizado /
            Custom Code).
          </li>
          <li>Cole o código iframe copiado acima dentro do campo HTML.</li>
          <li>
            Clique em <strong>Publicar</strong> ou <strong>Atualizar</strong> a página.
          </li>
          <li>O chat aparecerá flutuando no canto inferior direito do seu site!</li>
        </ol>
      </div>
    </div>
  )
}
