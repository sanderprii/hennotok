// client/src/components/TopicPosts.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Empty, Spin, message, Modal } from 'antd';
import { HeartOutlined, MessageOutlined, ShareAltOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import '../styles/TopicPosts.css';

const TopicPosts = () => {
    const { topicId } = useParams();
    const [posts, setPosts] = useState([]);
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [currentMedia, setCurrentMedia] = useState(null);
    const videoRefs = useRef({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchTopicPosts();
    }, [topicId]);

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

    const fetchTopicPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/posts?topicId=${topicId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }

            const data = await response.json();
            setPosts(data);

            // Set topic name if posts exist
            if (data.length > 0) {
                setTopic(data[0].topic);
            } else {
                // Fetch topic name if no posts
                const topicResponse = await fetch(`http://localhost:5000/api/posts/topics`);
                if (topicResponse.ok) {
                    const topics = await topicResponse.json();
                    const currentTopic = topics.find(t => t.id === parseInt(topicId));
                    if (currentTopic) {
                        setTopic(currentTopic);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching topic posts:', error);
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

    // Set up video ref for a post
    const setVideoRef = (postId, element) => {
        videoRefs.current[postId] = element;
        if (element) {
            element.play().catch(e => {
                console.log("Video preview autoplay prevented on ref setup:", e);
            });
        }
    };

    const handleBack = () => {
        navigate('/discover');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="topic-posts-container">
            <div className="topic-header">
                <button className="back-button" onClick={handleBack}>
                    <ArrowLeftOutlined />
                </button>
                <h2 className="topic-title">{topic ? topic.name : 'Topic'}</h2>
            </div>

            {posts.length === 0 ? (
                <Empty description={`No posts found in ${topic ? topic.name : 'this topic'}`} />
            ) : (
                <div className="post-feed">
                    {posts.map(post => (
                        <div key={post.id} className="post-item">
                            <div className="post-header">
                                <div className="post-user">
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
                                {post.description && (
                                    <div className="post-description">{post.description}</div>
                                )}
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

export default TopicPosts;