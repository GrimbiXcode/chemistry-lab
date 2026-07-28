import { Routes, Route, Navigate, Outlet } from 'react-router'
import Home from './pages/Home'
import ModulePage from './pages/ModulePage'
import Glossary from './pages/Glossary'
import Review from './pages/Review'
import Exam from './pages/Exam'
import Labs from './pages/Labs'
import LabPage from './pages/LabPage'
import Disclaimer from './pages/Disclaimer'
import { I18nProvider } from './i18n'

function I18nProviderWithOutlet() {
  return (
    <I18nProvider>
      <Outlet />
    </I18nProvider>
  )
}

const pageRoutes = (
  <>
    <Route index element={<Home />} />
    <Route path="modul/:id" element={<ModulePage />} />
    <Route path="glossar" element={<Glossary />} />
    <Route path="fehler" element={<Review />} />
    <Route path="pruefung" element={<Exam />} />
    <Route path="labore" element={<Labs />} />
    <Route path="labor/:id" element={<LabPage />} />
    <Route path="disclaimer" element={<Disclaimer />} />
  </>
)

export default function App() {
  return (
    <Routes>
      <Route element={<I18nProviderWithOutlet />}>
        <Route path="/">{pageRoutes}</Route>
        <Route path="/:lang">{pageRoutes}</Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
