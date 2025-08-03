import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import socket from "./socket.js"
import Home from './pages/home/Home';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home socket={socket} />}/>
            </Routes>
        </Router>
    );
}

export default App;

