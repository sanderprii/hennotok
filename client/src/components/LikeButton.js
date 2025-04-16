// client/src/components/LikeButton.js
import React, { useState } from 'react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { message } from 'antd';
import { API_BASE_URL } from '../config';
import '../styles/LikeButton.css';

const LikeButton = ({ postId, initialLiked = false, initialCount = 0, onLikeChange }) => {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialCount);
    const [isLoading, setIsLoading] = useState(false);

    const handleLikeToggle = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const method = isLiked ? 'DELETE' : 'POST';
            const response = await fetch(`${API_BASE_URL}/api/likes/posts/${postId}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isLiked ? 'unlike' : 'like'} post`);
            }

            // Update state
            const newLikedState = !isLiked;
            setIsLiked(newLikedState);
            setLikeCount(prevCount => newLikedState ? prevCount + 1 : prevCount - 1);

            // Notify parent component
            if (onLikeChange) {
                onLikeChange(newLikedState, newLikedState ? likeCount + 1 : likeCount - 1);
            }
        } catch (error) {
            console.error('Like toggle error:', error);
            message.error(`Failed to ${isLiked ? 'unlike' : 'like'} post`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="like-button-container">
            <button
                className={`like-button ${isLiked ? 'liked' : ''}`}
                onClick={handleLikeToggle}
                disabled={isLoading}
            >
                {isLiked ? <HeartFilled /> : <HeartOutlined />}
                <span className="like-count">{likeCount}</span>
            </button>
        </div>
    );
};

export default LikeButton;
