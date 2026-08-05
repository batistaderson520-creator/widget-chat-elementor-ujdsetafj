routerAdd('POST', '/backend/v1/widget/chat', (e) => {
  try {
    const body = e.requestInfo().body || {}
    const sessionId = String(body.session_id || '').trim()
    const message = String(body.message || '').trim()

    if (!sessionId || !message) {
      return e.badRequestError('session_id and message are required')
    }

    const messagesCol = $app.findCollectionByNameOrId('messages')
    const userMsg = new Record(messagesCol)
    userMsg.set('session_id', sessionId)
    userMsg.set('role', 'user')
    userMsg.set('content', message)
    $app.save(userMsg)

    let serviceUserId = ''
    try {
      const visitorRec = $app.findAuthRecordByEmail('_pb_users_auth_', 'visitante@app.local')
      serviceUserId = visitorRec.id
    } catch (_) {
      if (e.auth?.id) {
        serviceUserId = e.auth.id
      }
    }

    if (!serviceUserId) {
      return e.internalServerError('User session initialization failed')
    }

    const iter = $ai.agent('widget-assistant').chat({
      user_id: serviceUserId,
      message: message,
      stream: true,
    })

    e.response.header().set('Content-Type', 'text/event-stream')
    e.response.header().set('Cache-Control', 'no-cache')

    let fullText = ''
    for (const event of iter) {
      if (event && event.type === 'chunk' && event.content) {
        fullText += event.content
      }
      const chunkData = 'event: ' + event.type + '\ndata: ' + JSON.stringify(event) + '\n\n'
      $response.write(e, chunkData)
      $response.flush(e)
    }

    if (fullText.trim()) {
      const astMsg = new Record(messagesCol)
      astMsg.set('session_id', sessionId)
      astMsg.set('role', 'assistant')
      astMsg.set('content', fullText)
      $app.save(astMsg)
    }

    return
  } catch (err) {
    return e.json(500, { error: err.message || 'Chat process failed' })
  }
})
