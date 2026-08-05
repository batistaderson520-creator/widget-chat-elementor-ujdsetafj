migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'widget-assistant',
      name: 'Assistente Virtual',
      description: 'Atendimento ao cliente e suporte para visitantes',
      systemPrompt:
        'Você é um assistente virtual de atendimento ao cliente amigável, prestativo e profissional em Português do Brasil. Responda às dúvidas dos clientes com base nas informações disponíveis. Mantenha as respostas concisas e diretas.',
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
                question: 'Como solicitar um orçamento?',
                answer:
                  'Você pode solicitar um orçamento enviando uma mensagem por este chat detalhando o serviço que você precisa!',
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

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'batistawandersonluis@gmail.com')
    } catch (_) {
      const adminRec = new Record(users)
      adminRec.setEmail('batistawandersonluis@gmail.com')
      adminRec.setPassword('Skip@Pass')
      adminRec.setVerified(true)
      adminRec.set('name', 'Administrador')
      app.save(adminRec)
    }

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'visitante@app.local')
    } catch (_) {
      const visitorRec = new Record(users)
      visitorRec.setEmail('visitante@app.local')
      visitorRec.setPassword($security.randomString(24))
      visitorRec.setVerified(true)
      visitorRec.set('name', 'Visitante Anônimo')
      app.save(visitorRec)
    }

    const configCol = app.findCollectionByNameOrId('widget_config')
    if (app.countRecords('widget_config') === 0) {
      const configRec = new Record(configCol)
      configRec.set('assistant_name', 'Assistente Virtual')
      configRec.set(
        'welcome_message',
        'Olá! 👋 Sou o assistente virtual deste site. Como posso ajudar você hoje?',
      )
      configRec.set('brand_color', '#6366f1')
      configRec.set('suggestion_chips', [
        'Como vocês funcionam?',
        'Quais os horários?',
        'Como solicitar orçamento?',
      ])
      app.save(configRec)
    }
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'widget-assistant')
    } catch (_) {}
  },
)
