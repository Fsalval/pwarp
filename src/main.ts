import './style.css'
import { initEditor } from './ui/editor'
import { supabase } from './lib/supabase'  // ← Ajusta la ruta
import { initLegalModal } from './ui/LegalModal'  // ← Ajusta la ruta

const app = document.querySelector<HTMLDivElement>('#app')!
initEditor(app)

// ✅ Inicializar el modal legal
initLegalModal(supabase)