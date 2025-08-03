import './App.css';
import {useState, useEffect} from 'react';
import {io} from 'socket.io-client';

console.log(import.meta.env.VITE_SOCKET_URL)
const socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: true,
    reconnectionAttempts: 3,
    timeout: 5000,
});

function App() {
    const [onlineCount, setOnlineCount] = useState(0);
    const [rooms, setRooms] = useState([]);
    const [joinUsername, setJoinUsername] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [createUsername, setCreateUsername] = useState('');
    const [connectionError, setConnectionError] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            setConnectionError(false);
            socket.emit('get_user_count');
            socket.emit('list_rooms');
        });

        socket.on('connect_error', () => {
            setConnectionError(true);
        });

        socket.on('disconnect', () => {
            setConnectionError(true);
        });

        socket.on('user_count', (data) => {
            setOnlineCount(data.count);
        });

        socket.on('room_list_update', (data) => {
            setRooms(data.rooms || []);
        });

        socket.on('room_info', (info) => {
            console.log('加入房间成功:', info);
        });

        socket.on('room_created', (data) => {
            console.log('房间创建成功:', data);
        });

        socket.on('error', (data) => {
            alert(data.message);
        });

        return () => {
            socket.off();
        };
    }, []);

    const handleJoin = (e) => {
        e.preventDefault();
        if (!joinUsername || !joinRoomId) return alert('请填写完整信息');
        socket.emit('join_room', {
            username: joinUsername,
            room: joinRoomId,
        });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!createUsername) return alert('请填写完整信息');
        socket.emit('create_room', {
            username: createUsername
        });
    };

    return (
        <div className="layout">
            <header className="navbar">
                <div className="logo">🐍 贪吃蛇 Online</div>
                <div className="status">在线人数：{onlineCount}</div>
            </header>

            {connectionError && (
                <div className="error-banner">
                    无法连接服务器，请检查网络或刷新重试。
                </div>
            )}

            <main className="content">
                <aside className="room-list">
                    <div className="section-title">房间列表</div>
                    <ul>
                        {rooms.map(room => (
                            <li key={room.room}>
                                <div className="room-id">房间号: {room.room}</div>
                                <div className="room-count">{room.user_count}人</div>
                                <div className="room-count">{room.status}</div>
                            </li>
                        ))}
                    </ul>
                </aside>

                <section className="main-panel">
                    <div className="card">
                        <h2>加入房间</h2>
                        <form onSubmit={handleJoin}>
                            <input
                                type="text"
                                placeholder="用户名"
                                value={joinUsername}
                                onChange={(e) => setJoinUsername(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="房间号"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
                            />
                            <button type="submit">加入</button>
                        </form>
                    </div>

                    <div className="card">
                        <h2>创建房间</h2>
                        <form onSubmit={handleCreate}>
                            <input
                                type="text"
                                placeholder="用户名"
                                value={createUsername}
                                onChange={(e) => setCreateUsername(e.target.value)}
                            />
                            <button type="submit">创建</button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default App;
