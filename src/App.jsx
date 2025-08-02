import './App.css';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000'); // 修改为你的后端地址

function App() {
    const [onlineCount, setOnlineCount] = useState(0);
    const [rooms, setRooms] = useState([]);
    const [joinUsername, setJoinUsername] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [createUsername, setCreateUsername] = useState('');

    useEffect(() => {
        // 请求最新人数和房间列表
        socket.emit('get_user_count');
        socket.emit('list_rooms');

        // 监听在线人数更新
        socket.on('user_count', (data) => {
            setOnlineCount(data.count);
        });

        // 监听房间列表更新
        socket.on('room_list_update', (data) => {
            setRooms(data.rooms || []);
        });

        // 加入房间成功后处理（可以加跳转或弹窗）
        socket.on('room_info', (info) => {
            console.log('加入房间成功:', info);
        });

        // 创建房间成功后处理
        socket.on('room_created', (data) => {
            console.log('房间创建成功:', data);
        });

        // 错误处理
        socket.on('error', (data) => {
            alert(data.message);
        });

        return () => {
            socket.off(); // 清理所有事件监听
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