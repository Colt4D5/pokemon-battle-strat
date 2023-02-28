<script lang="ts">
  import type { CreateCompletionResponse } from 'openai';
  import { SSE } from 'sse.js'
  import '@picocss/pico/css/pico.min.css'

  let loading = false
  let error = false
  let answer = ''
  let game = ''
  let opponent = ''

  const handleSubmit = async () => {
    loading = true
    error = false

    const eventSource = new SSE('/api/strat', {
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({ game, opponent })
    })

    game = ''
    opponent = ''

    eventSource.addEventListener('error', e => {
      error = true
      loading = false
      alert('Uh oh, something went wrong...')
    })

    eventSource.addEventListener('message', e => {
      try {
        loading = false

        if (e.data === '[DONE]') {
          return
        }

        const completionResponse: CreateCompletionResponse = JSON.parse(e.data)

        const [{ text }] = completionResponse.choices

        answer = (answer ?? '') + text
      } catch (err) {
        error = true
        loading = false
        console.error(err)
        alert('Something went wrong, my friend...')
      }
    })

    eventSource.stream()
  }
</script>

<main class="container">
  <h1>Pokémon Battle Strategist</h1>
  <form on:submit|preventDefault={() => handleSubmit()}>
    <label for="game">Select game: </label>
    <select name="game" id="game" bind:value={game}>
      <option value="blue">Pokémon Blue</option>
      <option value="red">Pokémon Red</option>
      <option value="yellow">Pokémon Yellow</option>
      <option value="silver">Pokémon Silver</option>
      <option value="gold">Pokémon Gold</option>
    </select>
    <div class="field-group">
      <label for="opponent">Opponent: </label>
      <input type="text" name="opponent" id="opponent" bind:value={opponent}>
    </div> 
    <div class="field-group">
      <input type="submit" name="submit" id="submit" value="Submit">
    </div> 
  </form>
  <div id="answer">
    <h2>Recommended Strat:</h2>
    {#if answer}
      <p>{ answer }</p>
    {/if}
  
  </div>
</main>
