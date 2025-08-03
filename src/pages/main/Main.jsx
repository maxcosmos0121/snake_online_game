import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

function Main({socket, connectionError}) {
    const [rooms, setRooms] = useState([]);
    const [joinUsername, setJoinUsername] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [createUsername, setCreateUsername] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        // 请求列表
        socket.emit('list_rooms');

        const handleRoomListUpdate = (data) => {
            setRooms(data.rooms || []);
        };

        const handleRoomCreated = (data) => {
            navigate(`/room/${data.room}`, {state: {username: createUsername}});
        };

        socket.on('room_list_update', handleRoomListUpdate);
        socket.on('room_created', handleRoomCreated);

        return () => {
            socket.off('room_list_update', handleRoomListUpdate);
            socket.off('room_created', handleRoomCreated);
        };
    }, [socket, createUsername, navigate]);

    const handleJoin = (e) => {
        e.preventDefault();
        if (!joinUsername || !joinRoomId) return alert('请填写完整信息');
        socket.emit('join_room', {
            username: joinUsername,
            room: joinRoomId,
        });
        navigate(`/room/${joinRoomId}`, {state: {username: joinUsername}});
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!createUsername) return alert('请填写完整信息');
        socket.emit('create_room', {
            username: createUsername,
        });
    };

    return (
        <>
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
                    <h2 className="card-title">加入房间</h2>
                    <form onSubmit={handleJoin}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="用户名"
                                value={joinUsername}
                                onChange={(e) => setJoinUsername(e.target.value)}
                                disabled={connectionError}
                                className="form-control"
                                style={{width: '100%'}}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="房间号"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
                                disabled={connectionError}
                                className="form-control"
                                style={{width: '100%'}}
                            />
                        </div>
                        <button type="submit" disabled={connectionError} className="btn btn-primary">加入</button>
                    </form>
                </div>

                <div className="card">
                    <h2 className="card-title">创建房间</h2>
                    <form onSubmit={handleCreate}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="用户名"
                                value={createUsername}
                                onChange={(e) => setCreateUsername(e.target.value)}
                                disabled={connectionError}
                                className="form-control"
                                style={{width: '100%'}}
                            />
                        </div>
                        <button type="submit" disabled={connectionError} className="btn btn-primary">创建</button>
                    </form>
                </div>
            </section>
        </>
    );
}

export default Main;