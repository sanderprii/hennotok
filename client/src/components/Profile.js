// client/src/components/Profile.js
import React, { useEffect, useState, useRef } from 'react';
import { Tabs, Button, Spin, Empty, message, Modal } from 'antd';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const { TabPane } = Tabs;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [currentMedia, setCurrentMedia] = useState(null);
    const videoRefs = useRef({});
    const navigate = useNavigate();

    useEffect(() => {
        // Get user data
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        fetchUserPosts();
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

    const fetchUserPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/posts/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }

            const data = await response.json();
            setPosts(data);

            // For now, we don't have saved posts functionality
            setSavedPosts([]);
        } catch (error) {
            console.error('Error fetching user posts:', error);
            message.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        message.success('Logged out successfully');
        navigate('/login');
    };

    const handleEditProfile = () => {
        // This would navigate to an edit profile page in the future
        message.info('Edit profile functionality will be implemented soon');
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

    if (loading) {
        return (
            <div className="profile-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="profile-username">{user.username}</h2>
                <p className="profile-bio">Bio description goes here...</p>

                <div className="profile-stats">
                    <div className="stat-item">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Following</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Followers</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Likes</div>
                    </div>
                </div>

                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    className="edit-profile-btn"
                    onClick={handleEditProfile}
                >
                    Edit Profile
                </Button>
            </div>

            <Tabs defaultActiveKey="posts" className="profile-tabs">
                <TabPane
                    tab={<div className="tab-icon">My Posts</div>}
                    key="posts"
                >
                    {posts.length === 0 ? (
                        <Empty
                            description="You haven't created any posts yet"
                            className="empty-posts"
                        />
                    ) : (
                        <div className="posts-grid">
                            {posts.map(post => (
                                <div
                                    key={post.id}
                                    className="post-thumbnail"
                                    onClick={() => post.fileType === 'video' ?
                                        handleVideoClick(post) : handleImageClick(post)}
                                >
                                    {post.fileType === 'video' ? (
                                        <>
                                            <video
                                                ref={(el) => setVideoRef(post.id, el)}
                                                className="thumbnail-video"
                                                src={`http://localhost:5000${post.fileUrl}`}
                                                muted
                                                loop
                                                playsInline
                                            />
                                            <div className="play-indicator">▶</div>
                                        </>
                                    ) : (
                                        <img
                                            src={`http://localhost:5000${post.thumbnailUrl}`}
                                            alt="Post thumbnail"
                                            className="thumbnail-image"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </TabPane>
                <TabPane
                    tab={<div className="tab-icon">Saved</div>}
                    key="saved"
                >
                    {savedPosts.length === 0 ? (
                        <Empty
                            description="You haven't saved any posts yet"
                            className="empty-posts"
                        />
                    ) : (
                        <div className="posts-grid">
                            {/* Saved posts would go here */}
                        </div>
                    )}
                </TabPane>
            </Tabs>

            <Button
                danger
                className="logout-btn"
                onClick={handleLogout}
            >
                Logout
            </Button>

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

export default Profile;