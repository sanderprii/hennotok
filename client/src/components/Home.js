// client/src/components/Home.js
import React, { useEffect, useState, useRef } from 'react';
import { Card, Empty, Spin, message, Modal } from 'antd';
import { HeartOutlined, MessageOutlined, ShareAltOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [currentMedia, setCurrentMedia] = useState(null);
    const videoRefs = useRef({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchFeedPosts();
    }, []);

    // Start playing video previews when posts are loaded
    useEffect(() => {
        posts.forEach(post => {
            if (post.fileType === 'video' && videoRefs.current[post.id]) {
                const videoElement = videoRefs.current[post.id];
                videoElement.play().catch(e => {
                    // Autoplay might be blocked by browser settings, that's ok
                    console.log("Video preview autoplay prevented:", e);
                });
            }
        });
    }, [posts]);

    const fetchFeedPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const response = await fetch('http://localhost:5000/api/posts/feed', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }

            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            message.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleVideoClick = (post) => {
        setCurrentMedia(`http://localhost:5000${post.fileUrl}`);
        setVideoModalVisible(true);
    };

    const handleImageClick = (post) => {
        setCurrentMedia(`http://localhost:5000${post.fileUrl}`);
        setImageModalVisible(true);
    };

    const handleCloseVideoModal = () => {
        setVideoModalVisible(false);
        setCurrentMedia(null);
    };

    const handleCloseImageModal = () => {
        setImageModalVisible(false);
        setCurrentMedia(null);
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
    };

    // Set up video ref for a post
    const setVideoRef = (postId, element) => {
        videoRefs.current[postId] = element;
        if (element) {
            element.play().catch(e => {
                console.log("Video preview autoplay prevented on ref setup:", e);
            });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="home-container">
            {posts.length === 0 ? (
                <div className="empty-feed-container">
                    <Empty description="No posts from people you follow" />
                    <p className="empty-feed-message">
                        Follow users to see their posts here, or explore new content
                        in the Discover tab.
                    </p>
                </div>
            ) : (
                <div className="post-feed">
                    {posts.map(post => (
                        <div key={post.id} className="post-item">
                            <div className="post-header">
                                <div
                                    className="post-user"
                                    onClick={() => handleUserClick(post.user.id)}
                                >
                                    <div className="user-avatar">
                                        {post.user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-name">@{post.user.username}</div>
                                </div>
                            </div>

                            <div className="post-content">
                                {post.fileType === 'image' ? (
                                    <div
                                        className="post-image-container"
                                        onClick={() => handleImageClick(post)}
                                    >
                                        <img
                                            src={`http://localhost:5000${post.fileUrl}`}
                                            alt="Post"
                                            className="post-image"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="post-video-container"
                                        onClick={() => handleVideoClick(post)}
                                    >
                                        <video
                                            ref={(el) => setVideoRef(post.id, el)}
                                            className="post-video"
                                            src={`http://localhost:5000${post.fileUrl}`}
                                            muted
                                            loop
                                            playsInline
                                        />
                                        <div className="video-play-indicator">
                                            <span>▶</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="post-footer">
                                <div className="post-actions">
                                    <div className="action-item">
                                        <HeartOutlined />
                                        <span className="action-count">0</span>
                                    </div>
                                    <div className="action-item">
                                        <MessageOutlined />
                                        <span className="action-count">0</span>
                                    </div>
                                    <div className="action-item">
                                        <ShareAltOutlined />
                                        <span className="action-count">0</span>
                                    </div>
                                </div>
                                <div className="post-info">
                                    <div className="post-topic">#{post.topic.name}</div>
                                    {post.description && (
                                        <div className="post-description">{post.description}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Video Modal */}
            <Modal
                open={videoModalVisible}
                onCancel={handleCloseVideoModal}
                footer={null}
                width="auto"
                className="media-modal video-modal"
                closeIcon={<CloseOutlined className="close-modal-icon" />}
                destroyOnClose={true}
            >
                <div className="video-player-container">
                    <video
                        controls
                        autoPlay
                        className="video-player"
                        src={currentMedia}
                        onError={(e) => {
                            console.error("Video error:", e);
                            message.error("Error playing video");
                        }}
                    />
                </div>
            </Modal>

            {/* Image Modal */}
            <Modal
                open={imageModalVisible}
                onCancel={handleCloseImageModal}
                footer={null}
                width="auto"
                className="media-modal image-modal"
                closeIcon={<CloseOutlined className="close-modal-icon" />}
                destroyOnClose={true}
            >
                <div className="image-container">
                    <img
                        className="fullsize-image"
                        src={currentMedia}
                        alt="Full size"
                        onError={(e) => {
                            console.error("Image error:", e);
                            message.error("Error displaying image");
                        }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Home;