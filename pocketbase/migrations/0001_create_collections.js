migrate(
  (app) => {
    const widgetConfig = new Collection({
      name: 'widget_config',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'assistant_name', type: 'text', required: true },
        { name: 'welcome_message', type: 'text', required: true },
        { name: 'brand_color', type: 'text', required: true },
        { name: 'suggestion_chips', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(widgetConfig)

    const messages = new Collection({
      name: 'messages',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: null,
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'session_id', type: 'text', required: true },
        {
          name: 'role',
          type: 'select',
          values: ['user', 'assistant'],
          maxSelect: 1,
          required: true,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_messages_session_id ON messages (session_id)',
        'CREATE INDEX idx_messages_created ON messages (created DESC)',
      ],
    })
    app.save(messages)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('messages'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('widget_config'))
    } catch (_) {}
  },
)
