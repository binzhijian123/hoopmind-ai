import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import CustomBoard from './pages/CustomBoard'
import Home from './pages/Home'
import Recommend from './pages/Recommend'
import SavedTactics from './pages/SavedTactics'
import Sources from './pages/Sources'
import TacticDemo from './pages/TacticDemo'
import TacticLibrary from './pages/TacticLibrary'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/custom" element={<CustomBoard />} />
        <Route path="/library" element={<TacticLibrary />} />
        <Route path="/tactic/:id" element={<TacticDemo />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/saved" element={<SavedTactics />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
