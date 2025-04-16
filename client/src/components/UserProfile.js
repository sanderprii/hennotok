// client/src/components/UserProfile.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Button, Spin, Empty, message, Modal } from 'antd';
import { ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';
import UserListsModal from './UserListsModal';
import { API_BASE_URL } from '../config';
import '../styles/Profile.css';

const { TabPane } = Tabs;

const UserProfile = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [currentMedia, setCurrentMedia] = useState(null);
    const [followersModalVisible, setFollowersModalVisible] = useState(false);
    const [followingModalVisible, setFollowingModalVisible] = useState(false);
    const videoRefs = useRef({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

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

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const data = await response.json();
            setProfile(data.user);
            setPosts(data.posts);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            message.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const method = profile.isFollowing ? 'DELETE' : 'POST';
            const response = await fetch(`${API_BASE_URL}/api/users/follow/${userId}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to ${profile.isFollowing ? 'unfollow' : 'follow'} user`);
            }

            // Update the profile state
            setProfile(prev => ({
                ...prev,
                isFollowing: !prev.isFollowing,
                _count: {
                    ...prev._count,
                    followers: prev.isFollowing
                        ? prev._count.followers - 1
                        : prev._count.followers + 1
                }
            }));

            message.success(`Successfully ${profile.isFollowing ? 'unfollowed' : 'followed'} user`);
        } catch (error) {
            console.error('Follow toggle error:', error);
            message.error(`Failed to ${profile.isFollowing ? 'unfollow' : 'follow'} user`);
        }
    };

    const handlePostNavigation = (post) => {
        navigate(`/post/${post.id}`);
    };

    // Add media preview functionality to the post detail view
    const openMediaPreview = (post) => {
        if (post.fileType === 'video') {
            setCurrentMedia(`${API_BASE_URL}${post.fileUrl}`);
            setVideoModalVisible(true);
        } else {
            setCurrentMedia(`${API_BASE_URL}${post.fileUrl}`);
            setImageModalVisible(true);
        }
    };

    const handleCloseVideoModal = () => {
        setVideoModalVisible(false);
        setCurrentMedia(null);
    };

    const handleCloseImageModal = () => {
        setImageModalVisible(false);
        setCurrentMedia(null);
    };

    const openFollowersModal = () => {
        setFollowersModalVisible(true);
    };

    const openFollowingModal = () => {
        setFollowingModalVisible(true);
    };

    const handleBack = () => {
        navigate(-1);
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

    if (!profile) {
        return (
            <div className="profile-error">
                <Empty description="User not found" />
                <Button type="primary" onClick={handleBack}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-back-button">
                <Button
                    icon={<ArrowLeftOutlined />}
                    type="text"
                    onClick={handleBack}
                />
            </div>

            <div className="profile-header">
                <div className="profile-avatar">
                    {profile.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="profile-username">{profile.username}</h2>
                <p className="profile-bio">{profile.bio}</p>

                <div className="profile-stats">
                    <div className="stat-item" onClick={openFollowingModal}>
                        <div className="stat-value">{profile._count.following}</div>
                        <div className="stat-label">Following</div>
                    </div>
                    <div className="stat-item" onClick={openFollowersModal}>
                        <div className="stat-value">{profile._count.followers}</div>
                        <div className="stat-label">Followers</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{posts.length}</div>
                        <div className="stat-label">Posts</div>
                    </div>
                </div>

                {!profile.isSelfProfile && (
                    <Button
                        type={profile.isFollowing ? "default" : "primary"}
                        className={profile.isFollowing ? "" : "follow-btn"}
                        onClick={handleFollowToggle}
                    >
                        {profile.isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                )}
            </div>

            <Tabs defaultActiveKey="posts" className="profile-tabs">
                <TabPane
                    tab={<div className="tab-icon">Posts</div>}
                    key="posts"
                >
                    {posts.length === 0 ? (
                        <Empty
                            description="No posts yet"
                            className="empty-posts"
                        />
                    ) : (
                        <div className="posts-grid">
                            {posts.map(post => (
                                <div
                                    key={post.id}
                                    className="post-thumbnail"
                                    onClick={() => handlePostNavigation(post)}
                                >
                                    {post.fileType === 'video' ? (
                                        <>
                                            <video
                                                ref={(el) => setVideoRef(post.id, el)}
                                                className="thumbnail-video"
                                                src={`${API_BASE_URL}${post.fileUrl}`}
                                                muted
                                                loop
                                                playsInline
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openMediaPreview(post);
                                                }}
                                            />
                                            <div
                                                className="play-indicator"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openMediaPreview(post);
                                                }}
                                            >▶</div>
                                        </>
                                    ) : (
                                        <img
                                            src={`${API_BASE_URL}${post.thumbnailUrl}`}
                                            alt="Post thumbnail"
                                            className="thumbnail-image"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openMediaPreview(post);
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </TabPane>
            </Tabs>

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

            {/* Followers/Following Modals */}
            <UserListsModal
                visible={followersModalVisible}
                type="followers"
                userId={userId}
                onCancel={() => setFollowersModalVisible(false)}
            />

            <UserListsModal
                visible={followingModalVisible}
                type="following"
                userId={userId}
                onCancel={() => setFollowingModalVisible(false)}
            />
        </div>
    );
};

export default UserProfile;