import { OPENAI_SECRET_KEY } from "$env/static/private"
import { oneLine, stripIndent } from "common-tags"
import type { RequestHandler } from "./$types"
import type { CreateCompletionRequest } from 'openai'
import { error } from "@sveltejs/kit"

export const POST: RequestHandler = async ({ request }) => {

  try {
    if (!OPENAI_SECRET_KEY) {
      throw new Error('OPENAI_SECRET_KEY not set')
    }

    const requestData = await request.json()

    if (!requestData) {
      throw new Error('Request data missing...')
    }

    const { game, opponent } = requestData

    if (!game) {
      throw new Error("No game provided...");
    }

    const prompt = stripIndent`
      ${oneLine`
        Please provide a list of 6 pokemon that would be most effective against the given Gym Leader in the provided game listed below.
      `}

      Pokemon Game: """Pokemon ${game.trim()}"""
      Gym Leader: """${opponent.trim()}"""

      Answer:
    `

    const completionOpts: CreateCompletionRequest = {
      model: 'text-davinci-003',
      prompt,
      max_tokens: 256,
      temperature: 0.9,
      stream: true
    }

    const response = await fetch('https://api.openai.com/v1/completions', {
      headers: {
        Authorization: `Bearer ${OPENAI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(completionOpts)
    })

    if (!response.ok) {
      const err = await response.json()
      console.log(err)
      throw new Error("Failed to create completion", err);
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream'
      }
    })

  } catch (err) {
    console.error(err)
    throw error(500, 'An error occured...')
  }

}