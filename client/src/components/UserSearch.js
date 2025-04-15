// client/src/components/UserSearch.js
import React, { useState } from 'react';
import { Input, List, Avatar, Button, Spin, message } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../styles/UserSearch.css';

const { Search } = Input;

const UserSearch = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (value) => {
        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setSearching(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/users/search?query=${encodeURIComponent(value)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to search users');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('User search error:', error);
            message.error('Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    const handleFollowToggle = async (userId, isFollowing) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const method = isFollowing ? 'DELETE' : 'POST';
            const response = await fetch(`http://localhost:5000/api/users/follow/${userId}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
            }

            // Update the local state to reflect the change
            setSearchResults(prev =>
                prev.map(user =>
                    user.id === userId
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

    return (
        <div className="user-search-container">
            <Search
                placeholder="Search users..."
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                loading={loading}
                className="user-search-input"
            />

            {searching && (
                <div className="search-results-container">
                    {loading ? (
                        <div className="search-loading">
                            <Spin />
                        </div>
                    ) : searchResults.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={searchResults}
                            renderItem={user => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type={user.isFollowing ? "default" : "primary"}
                                            size="small"
                                            onClick={() => handleFollowToggle(user.id, user.isFollowing)}
                                        >
                                            {user.isFollowing ? 'Unfollow' : 'Follow'}
                                        </Button>
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
                                                <span>{user._count.posts} posts</span>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <div className="no-results">No users found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserSearch;