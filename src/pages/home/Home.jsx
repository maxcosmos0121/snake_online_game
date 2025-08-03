// 不再需要导入Home.css，样式已在全局样式中处理
import Header from "../../component/Header.jsx";
import {Route, Routes} from "react-router-dom";
import Room from "../room/Room.jsx";
import Main from "../main/Main.jsx";
import {useState, useEffect} from 'react';

function Home({socket}) {
    const [connectionError, setConnectionError] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        socket.on('connect', () => {
            setConnectionError(false);
            socket.emit('get_user_count');
        });

        socket.on('connect_error', () => {
            setConnectionError(true);
        });

        socket.on('disconnect', () => {
            setConnectionError(true);
        });

        socket.on('user_count', data => {
            setOnlineCount(data.count);
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
            socket.off('user_count');
        };
    }, [socket]);

    return (
        <div className="layout">
            <Header onlineCount={onlineCount}/>
            {connectionError && (
                <div className="error-banner">
                    无法连接服务器，请检查网络或刷新重试。
                </div>
            )}
            <main className="content">
                <Routes>
                    <Route path="/" element={<Main socket={socket} connectionError={connectionError}/>}/>
                    <Route path="/room/:roomId" element={<Room socket={socket}/>}/>
                </Routes>
            </main>
        </div>
    );
}

export default Home;
