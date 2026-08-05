migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'widget-assistant',
      name: 'Assistente de ISTs',
      description:
        'Assistente virtual para tirar dúvidas sobre ISTs (Infecções Sexualmente Transmissíveis)',
      systemPrompt:
        'Você é um assistente virtual especializado em tirar dúvidas sobre ISTs (Infecções Sexualmente Transmissíveis). Apresente-se sempre dizendo que é assistente para tirar dúvidas sobre ISTs. Responda às perguntas dos visitantes com clareza, empatia e em Português do Brasil. Mantenha as respostas concisas, diretas e baseadas em informações de saúde pública confiáveis. Se uma pergunta estiver fora do escopo de ISTs, oriente o visitante a procurar um profissional de saúde.',
      tier: 'fast',
      tools: [],
      memory: [
        {
          type: 'faq',
          payload: {
            qa: [
              {
                question: 'Como entro em contato?',
                answer:
                  'Você pode nos contatar por este chat de atendimento ou pelo e-mail suporte@empresa.com.br.',
              },
              {
                question: 'Quais os horários de funcionamento?',
                answer: 'Nosso atendimento funciona de segunda a sexta-feira, das 08h às 18h.',
              },
              {
                question: 'Onde vocês estão localizados?',
                answer: 'Atendemos clientes em todo o Brasil de forma 100% online com agilidade.',
              },
            ],
          },
        },
      ],
    })

    try {
      const configCol = app.findCollectionByNameOrId('widget_config')
      const records = app.findRecordsByFilter('widget_config', '', '-created', 1, 0)
      if (records.length > 0) {
        const rec = records[0]
        rec.set('assistant_name', 'Assistente de ISTs')
        rec.set(
          'welcome_message',
          'Olá! 👋 Sou assistente para tirar dúvidas sobre ISTs. Como posso ajudar você hoje?',
        )
        app.save(rec)
      } else {
        const configRec = new Record(configCol)
        configRec.set('assistant_name', 'Assistente de ISTs')
        configRec.set(
          'welcome_message',
          'Olá! 👋 Sou assistente para tirar dúvidas sobre ISTs. Como posso ajudar você hoje?',
        )
        configRec.set('brand_color', '#6366f1')
        configRec.set('suggestion_chips', [
          'O que são ISTs?',
          'Como prevenir ISTs?',
          'Quais os sintomas mais comuns?',
        ])
        app.save(configRec)
      }
    } catch (err) {
      console.log('Failed to update widget_config:', err)
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter('widget_config', '', '-created', 1, 0)
      if (records.length > 0) {
        const rec = records[0]
        rec.set('assistant_name', 'Assistente Virtual')
        rec.set(
          'welcome_message',
          'Olá! 👋 Sou o assistente virtual deste site. Como posso ajudar você hoje?',
        )
        app.save(rec)
      }
    } catch (_) {}

    try {
      $ai.agents.define(app, {
        slug: 'widget-assistant',
        name: 'Assistente Virtual',
        description: 'Atendimento ao cliente e suporte para visitantes',
        systemPrompt:
          'Você é um assistente virtual de atendimento ao cliente amigável, prestativo e profissional em Português do Brasil. Responda às dúvidas dos clientes com base nas informações disponíveis. Mantenha as respostas concisas e diretas.',
        tier: 'fast',
        tools: [],
        memory: [],
      })
    } catch (_) {}
  },
)
