// client/src/components/PostDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Button, Modal } from 'antd';
import { ArrowLeftOutlined, ShareAltOutlined, CloseOutlined } from '@ant-design/icons';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { API_BASE_URL } from '../config';
import '../styles/PostDetail.css';

const PostDetail = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPostDetails();
    }, [postId]);

    const fetchPostDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                navigate('/login');
                return;
            }

            // This endpoint would need to be implemented on the backend
            const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch post details');
            }

            const data = await response.json();
            setPost(data);
        } catch (error) {
            console.error('Error fetching post details:', error);
            message.error('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handleVideoClick = () => {
        setVideoModalVisible(true);
    };

    const handleImageClick = () => {
        setImageModalVisible(true);
    };

    const handleCloseVideoModal = () => {
        setVideoModalVisible(false);
    };

    const handleCloseImageModal = () => {
        setImageModalVisible(false);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
    };

    if (loading) {
        return (
            <div className="post-detail-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="post-detail-error">
                <p>Post not found</p>
                <Button type="primary" onClick={handleBack}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="post-detail-container">
            <div className="post-detail-header">
                <Button
                    icon={<ArrowLeftOutlined />}
                    type="text"
                    onClick={handleBack}
                    className="back-button"
                />
                <h2>Post</h2>
            </div>

            <div className="post-detail-content">
                <div className="post-user-info" onClick={() => handleUserClick(post.user.id)}>
                    <div className="user-avatar">
                        {post.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-name">@{post.user.username}</div>
                </div>

                <div className="post-media">
                    {post.fileType === 'image' ? (
                        <div className="post-image-container" onClick={handleImageClick}>
                            <img
                                src={`${API_BASE_URL}${post.fileUrl}`}
                                alt="Post"
                                className="post-image"
                            />
                        </div>
                    ) : (
                        <div className="post-video-container" onClick={handleVideoClick}>
                            <video
                                className="post-video"
                                src={`${API_BASE_URL}${post.fileUrl}`}
                                controls
                            />
                        </div>
                    )}
                </div>

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

                <div className="post-comments">
                    <CommentSection
                        postId={post.id}
                        initialCommentCount={post._count?.comments || 0}
                    />
                </div>
            </div>

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
                        src={`${API_BASE_URL}${post.fileUrl}`}
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
                        src={`${API_BASE_URL}${post.fileUrl}`}
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

export default PostDetail;
