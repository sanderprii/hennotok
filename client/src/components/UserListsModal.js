// client/src/components/UserListsModal.js
import React, { useState, useEffect } from 'react';
import { Modal, List, Avatar, Button, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../styles/UserListsModal.css';

const UserListsModal = ({ visible, type, userId, onCancel }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (visible) {
            fetchUsers();
        }
    }, [visible, type, userId]);

    const fetchUsers = async () => {
        if (!visible) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const endpoint = userId
                ? `http://localhost:5000/api/users/${userId}/${type}`
                : `http://localhost:5000/api/users/${type}`;

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch ${type}`);
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error(`Fetch ${type} error:`, error);
            message.error(`Failed to load ${type}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (targetId, isFollowing) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const method = isFollowing ? 'DELETE' : 'POST';
            const response = await fetch(`http://localhost:5000/api/users/follow/${targetId}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
            }

            // Update the local state to reflect the change
            setUsers(prev =>
                prev.map(user =>
                    user.id === targetId
                        ? { ...user, isFollowing: !isFollowing }
                        : user
                )
            );

            message.success(`Successfully ${isFollowing ? 'unfollowed' : 'followed'} user`);
        } catch (error) {
            console.error('Follow toggle error:', error);
            message.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
        }
    };

    const handleViewProfile = (targetId) => {
        navigate(`/profile/${targetId}`);
        onCancel();
    };

    return (
        <Modal
            title={type === 'followers' ? 'Followers' : 'Following'}
            open={visible}
            onCancel={onCancel}
            footer={null}
            className="user-lists-modal"
        >
            {loading ? (
                <div className="modal-loading">
                    <Spin />
                </div>
            ) : users.length > 0 ? (
                <List
                    dataSource={users}
                    renderItem={user => (
                        <List.Item
                            actions={[
                                !user.isSelf && (
                                    <Button
                                        type={user.isFollowing ? "default" : "primary"}
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFollowToggle(user.id, user.isFollowing);
                                        }}
                                    >
                                        {user.isFollowing ? 'Unfollow' : 'Follow'}
                                    </Button>
                                )
                            ]}
                            className="user-list-item"
                            onClick={() => handleViewProfile(user.id)}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        size="large"
                                        style={{ backgroundColor: '#ff4d94' }}
                                    >
                                        {user.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                }
                                title={user.username}
                                description={
                                    <div className="user-stats">
                                        <span>{user._count.followers} followers</span>
                                        <span>{user._count.following} following</span>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <div className="no-users">
                    {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                </div>
            )}
        </Modal>
    );
};

export default UserListsModal;