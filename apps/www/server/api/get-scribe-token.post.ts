export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const apiKey = config.elevenlabsApiKey || process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      console.warn('ELEVENLABS_API_KEY is not set in environment variables.')
      return { error: 'Service not configured' }
    }

    const response = await fetch(
      'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to get Scribe token from ElevenLabs:', errorText)
      return { error: 'Failed to get transcription token' }
    }

    const data = await response.json()

    if (!data.token) {
      return { error: 'Invalid token response' }
    }

    return { token: data.token }
  }
  catch (error) {
    console.error('Error getting Scribe token:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to get token',
    }
  }
})
