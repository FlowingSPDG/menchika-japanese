<script lang="ts">
  import { onMount } from 'svelte'
  import '$lib/app.css'
  import { preloadSuzume } from '$lib/normalize/suzume-init'
  import { initTheme } from '$lib/theme'

  let { children } = $props()

  onMount(() => {
    initTheme()
    preloadSuzume()
  })
</script>

{@render children()}
