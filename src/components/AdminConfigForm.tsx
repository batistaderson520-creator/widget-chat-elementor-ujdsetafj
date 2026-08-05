import { useState } from 'react'
import { WidgetConfig, updateWidgetConfig } from '@/services/widget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function AdminConfigForm({
  config,
  onSaveSuccess,
}: {
  config: WidgetConfig
  onSaveSuccess: (updated: WidgetConfig) => void
}) {
  const [name, setName] = useState(config.assistant_name)
  const [welcome, setWelcome] = useState(config.welcome_message)
  const [color, setColor] = useState(config.brand_color)
  const [chips, setChips] = useState<string[]>(config.suggestion_chips || [])
  const [newChip, setNewChip] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleAddChip = () => {
    if (newChip.trim()) {
      setChips([...chips, newChip.trim()])
      setNewChip('')
    }
  }

  const handleRemoveChip = (index: number) => {
    setChips(chips.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateWidgetConfig(config.id, {
        assistant_name: name,
        welcome_message: welcome,
        brand_color: color,
        suggestion_chips: chips,
      })
      onSaveSuccess(updated)
      toast({
        title: 'Configurações salvas',
        description: 'O widget foi atualizado com sucesso.',
      })
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="assistant_name">Nome do Assistente</Label>
        <Input
          id="assistant_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="welcome_message">Mensagem de Boas-Vindas</Label>
        <Textarea
          id="welcome_message"
          rows={3}
          value={welcome}
          onChange={(e) => setWelcome(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_color">Cor Principal (Brand Color)</Label>
        <div className="flex items-center space-x-3">
          <Input
            type="color"
            id="brand_color_picker"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            id="brand_color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="font-mono uppercase w-36"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sugestões Rápidas (Chips)</Label>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Ex: Quais os planos?"
            value={newChip}
            onChange={(e) => setNewChip(e.target.value)}
          />
          <Button type="button" onClick={handleAddChip} variant="secondary">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {chips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              {chip}
              <button
                type="button"
                onClick={() => handleRemoveChip(idx)}
                className="ml-2 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </form>
  )
}
