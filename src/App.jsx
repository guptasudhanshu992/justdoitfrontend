import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Layout from './components/layout/Layout'
import Home from './pages/public/Home'
import Blog from './pages/public/Blog'
import BlogDetails from './pages/public/BlogDetails'
import About from './pages/public/About'
import AdminDashboard from './pages/admin/Admin'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
