// client/src/components/Home.js
import React, { useEffect, useState, useRef } from 'react';
import { Card, Empty, Spin, message, Modal } from 'antd';
import { ShareAltOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import '../styles/Home.css';
import { API_BASE_URL } from '../config';

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

            const response = await fetch(`${API_BASE_URL}/api/posts/feed`, {
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

    const handlePostClick = (post) => {
        navigate(`/post/${post.id}`);
    };

    const handleVideoClick = (post, e) => {
        e.stopPropagation(); // Prevent navigation to post detail
        setCurrentMedia(`${API_BASE_URL}${post.fileUrl}`);
        setVideoModalVisible(true);
    };

    const handleImageClick = (post, e) => {
        e.stopPropagation(); // Prevent navigation to post detail
        setCurrentMedia(`${API_BASE_URL}${post.fileUrl}`);
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
                        <div key={post.id} className="post-item" onClick={() => handlePostClick(post)}>
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
                                        onClick={(e) => handleImageClick(post, e)}
                                    >
                                        <img
                                            src={`${API_BASE_URL}${post.fileUrl}`}
                                            alt="Post"
                                            className="post-image"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="post-video-container"
                                        onClick={(e) => handleVideoClick(post, e)}
                                    >
                                        <video
                                            ref={(el) => setVideoRef(post.id, el)}
                                            className="post-video"
                                            src={`${API_BASE_URL}${post.fileUrl}`}
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
                                    <LikeButton
                                        postId={post.id}
                                        initialLiked={post.isLiked || false}
                                        initialCount={post._count?.likes || 0}
                                    />
                                    <div className="action-item">
                                        <ShareAltOutlined />
                                    </div>
                                </div>
                                <div className="post-info">
                                    <div className="post-topic">#{post.topic.name}</div>
                                    {post.description && (
                                        <div className="post-description">{post.description}</div>
                                    )}
                                </div>

                                {/* Comment section */}
                                <CommentSection
                                    postId={post.id}
                                    initialCommentCount={post._count?.comments || 0}
                                />
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