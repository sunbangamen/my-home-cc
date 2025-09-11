import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Photos from './pages/Photos';
import TestPhotos from './pages/TestPhotos';
import Events from './pages/Events';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navigation />
        <main style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 16px 32px 16px' 
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/albums/:id" element={<AlbumDetail />} />
            <Route path="/events" element={<Events />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;