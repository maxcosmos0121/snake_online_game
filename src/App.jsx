import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import socket from "./socket.js";
import Home from './pages/home/Home';
import './styles/index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Home socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;