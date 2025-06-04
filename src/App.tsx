import { Routes, Route } from 'react-router-dom'
import ProductSelection from './components/ProductSelection'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductSelection />} />
    </Routes>
  )
}

export default App