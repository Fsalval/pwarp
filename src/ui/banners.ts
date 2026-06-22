// Banner Template System
function generateSeparator(text: string): string {
  if (!text) return '✦·...·✦'
  return `✦·${text}·✦`
}

function generateAbout(data: { name: string; faction: string; age: string; job: string; traits: string }): string {
  const { name = '', faction = '', age = '', job = '', traits = '' } = data
  return [name, faction, age, job, traits].filter(Boolean).join(' | ')
}

function generateChar(
  data: { name?: string; race?: string; class?: string; level?: string; traits?: string } = {}
): string {
  const { name = '', race = '', class: charClass = '', level = '', traits = '' } = data

  const line1 = `┌${'─'.repeat(30)}┐`
  const line2 = `│ ${name.padEnd(28)} │`
  const line3 = `│ ${(race + ' ' + charClass).padEnd(28)} │`
  const line4 = `│ Nivel: ${level.padEnd(20)} │`
  const line5 = `│ ${traits.padEnd(28)} │`
  const line6 = `└${'─'.repeat(30)}┘`
  return [line1, line2, line3, line4, line5, line6].join('\n')
}

function renderBanners(): void {
  const container = document.getElementById('banners-container')
  if (!container) return

  container.innerHTML = `
    <div class="banners-template">
      <h3>Separador</h3>
      <div class="banners-template-form">
        <input type="text" class="tpl-input" id="banner-sep-input" placeholder="Texto del separador" />
        <div class="banners-template-preview" id="banner-sep-preview">✦·...·✦</div>
        <button type="button" class="sym-copy-btn" id="banner-sep-copy">Copiar</button>
      </div>
    </div>

    <div class="banners-template">
      <h3>About Me</h3>
      <div class="banners-template-form">
        <input type="text" class="tpl-input" id="banner-about-name" placeholder="Nombre" />
        <input type="text" class="tpl-input" id="banner-about-faction" placeholder="Facción" />
        <input type="text" class="tpl-input" id="banner-about-age" placeholder="Edad" />
        <input type="text" class="tpl-input" id="banner-about-job" placeholder="Profesión" />
        <input type="text" class="tpl-input" id="banner-about-traits" placeholder="Características" />
        <div class="banners-template-preview" id="banner-about-preview"></div>
        <button type="button" class="sym-copy-btn" id="banner-about-copy">Copiar</button>
      </div>
    </div>

    <div class="banners-template">
      <h3>Ficha de Personaje</h3>
      <div class="banners-template-form">
        <input type="text" class="tpl-input" id="banner-char-name" placeholder="Nombre" />
        <input type="text" class="tpl-input" id="banner-char-race" placeholder="Raza" />
        <input type="text" class="tpl-input" id="banner-char-class" placeholder="Clase" />
        <input type="text" class="tpl-input" id="banner-char-level" placeholder="Nivel" />
        <input type="text" class="tpl-input" id="banner-char-traits" placeholder="Características" />
        <pre class="banners-template-preview" id="banner-char-preview"></pre>
        <button type="button" class="sym-copy-btn" id="banner-char-copy">Copiar</button>
      </div>
    </div>
  `

  attachBannerInputs()
}

function attachBannerInputs(): void {
  // Separator
  const sepInput = document.getElementById('banner-sep-input') as HTMLInputElement
  const sepPreview = document.getElementById('banner-sep-preview')
  const sepCopy = document.getElementById('banner-sep-copy')

  sepInput?.addEventListener('input', () => {
    const result = generateSeparator(sepInput.value)
    if (sepPreview) sepPreview.textContent = result
  })

  sepCopy?.addEventListener('click', () => {
    const result = generateSeparator(sepInput.value)
    navigator.clipboard.writeText(result)
  })

  // About
  const aboutName = document.getElementById('banner-about-name') as HTMLInputElement
  const aboutFaction = document.getElementById('banner-about-faction') as HTMLInputElement
  const aboutAge = document.getElementById('banner-about-age') as HTMLInputElement
  const aboutJob = document.getElementById('banner-about-job') as HTMLInputElement
  const aboutTraits = document.getElementById('banner-about-traits') as HTMLInputElement
  const aboutPreview = document.getElementById('banner-about-preview')
  const aboutCopy = document.getElementById('banner-about-copy')

  const updateAboutPreview = () => {
    const result = generateAbout({
      name: aboutName.value,
      faction: aboutFaction.value,
      age: aboutAge.value,
      job: aboutJob.value,
      traits: aboutTraits.value
    })
    if (aboutPreview) aboutPreview.textContent = result || '(vacío)'
  }

  aboutName?.addEventListener('input', updateAboutPreview)
  aboutFaction?.addEventListener('input', updateAboutPreview)
  aboutAge?.addEventListener('input', updateAboutPreview)
  aboutJob?.addEventListener('input', updateAboutPreview)
  aboutTraits?.addEventListener('input', updateAboutPreview)

  aboutCopy?.addEventListener('click', () => {
    const result = generateAbout({
      name: aboutName.value,
      faction: aboutFaction.value,
      age: aboutAge.value,
      job: aboutJob.value,
      traits: aboutTraits.value
    })
    navigator.clipboard.writeText(result)
  })

  // Character
  const charName = document.getElementById('banner-char-name') as HTMLInputElement
  const charRace = document.getElementById('banner-char-race') as HTMLInputElement
  const charClass = document.getElementById('banner-char-class') as HTMLInputElement
  const charLevel = document.getElementById('banner-char-level') as HTMLInputElement
  const charTraits = document.getElementById('banner-char-traits') as HTMLInputElement
  const charPreview = document.getElementById('banner-char-preview')
  const charCopy = document.getElementById('banner-char-copy')

  const updateCharPreview = () => {
    const result = generateChar({
      name: charName.value,
      race: charRace.value,
      class: charClass.value,
      level: charLevel.value,
      traits: charTraits.value
    })
    if (charPreview) charPreview.textContent = result
  }

  charName?.addEventListener('input', updateCharPreview)
  charRace?.addEventListener('input', updateCharPreview)
  charClass?.addEventListener('input', updateCharPreview)
  charLevel?.addEventListener('input', updateCharPreview)
  charTraits?.addEventListener('input', updateCharPreview)

  charCopy?.addEventListener('click', () => {
    const result = generateChar({
      name: charName.value,
      race: charRace.value,
      class: charClass.value,
      level: charLevel.value,
      traits: charTraits.value
    })
    navigator.clipboard.writeText(result)
  })

  updateAboutPreview()
  updateCharPreview()
}

export function bindBanners(): void {
  renderBanners()
}
