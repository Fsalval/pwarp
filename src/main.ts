import './style.css'
import { initEditor } from './ui/editor'
import { initLegalModal } from './lib/LegalModal'


initLegalModal(supabase)  // tu cliente existente

initLegalModal(supabase)  // tu cliente existente

const app = document.querySelector<HTMLDivElement>('#app')!
initEditor(app)