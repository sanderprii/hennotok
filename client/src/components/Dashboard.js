// client/src/components/Dashboard.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Layout, message, Card, Empty, Spin, Modal } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import '../styles/Dashboard.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [currentMedia, setCurrentMedia] = useState(null);
    const videoRefs = useRef({});
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            message.error('Please login to continue');
            navigate('/login');
            return;
        }

        setUser(JSON.parse(userData));

        // Fetch user's posts
        const fetchPosts = async () => {
            try {
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
            } catch (error) {
                console.error('Error fetching posts:', error);
                message.error('Failed to load posts');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [navigate]);

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

    const handleLogout = () => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        message.success('Logged out successfully');
        navigate('/login');
    };

    const handleCreatePost = () => {
        navigate('/create-post');
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

    if (!user) {
        return null; // Or show a loading spinner
    }

    return (
        <Layout className="dashboard-layout">
            <Header className="dashboard-header">
                <div className="logo" />
                <div className="user-info">
                    <span>Welcome, {user.username}!</span>
                    <Button onClick={handleLogout} type="link">
                        Logout
                    </Button>
                </div>
            </Header>
            <Content className="dashboard-content">
                <div className="dashboard-title-container">
                    <Title level={2}>Dashboard</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreatePost}
                        className="create-post-btn"
                    >
                        Create Post
                    </Button>
                </div>

                <div className="content-box">
                    <Title level={4}>Your Posts</Title>

                    {loading ? (
                        <div className="loading-container">
                            <Spin size="large" />
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="posts-grid">
                            {posts.map(post => (
                                <Card
                                    key={post.id}
                                    className="post-card"
                                    cover={
                                        post.fileType === 'image' ? (
                                            <div
                                                className="image-thumbnail-container"
                                                onClick={() => handleImageClick(post)}
                                            >
                                                <img
                                                    alt="Post thumbnail"
                                                    src={`http://localhost:5000${post.thumbnailUrl}`}
                                                />
                                                <div className="image-overlay">
                                                    <span>👁️</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="video-thumbnail-container"
                                                onClick={() => handleVideoClick(post)}
                                            >
                                                <video
                                                    ref={(el) => setVideoRef(post.id, el)}
                                                    className="video-preview"
                                                    src={`http://localhost:5000${post.fileUrl}`}
                                                    muted
                                                    loop
                                                    playsInline
                                                />
                                                <div className="video-indicator">
                                                    <span>▶</span>
                                                </div>
                                            </div>
                                        )
                                    }
                                >
                                    <Card.Meta
                                        title={post.topic.name}
                                        description={post.description || 'No description'}
                                    />
                                    <div className="post-date">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Empty
                            description="You haven't created any posts yet"
                            className="empty-posts"
                        />
                    )}
                </div>
            </Content>

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
        </Layout>
    );
};

export default Dashboard;