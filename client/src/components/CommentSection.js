// client/src/components/CommentSection.js
import React, { useState, useEffect } from 'react';
import { Input, Button, List, Avatar, Spin, message, Tooltip, Modal } from 'antd';
import { SendOutlined, HeartOutlined, HeartFilled, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { API_BASE_URL } from '../config';
import '../styles/CommentSection.css';

const { TextArea } = Input;

const CommentSection = ({ postId, initialCommentCount = 0 }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    // Fetch comments when expanded
    useEffect(() => {
        if (expanded) {
            fetchComments();
        }
    }, [expanded]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/comments/posts/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Fetch comments error:', error);
            message.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/comments/posts/${postId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newComment })
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }

            const data = await response.json();

            // If not expanded, expand to show comments
            if (!expanded) {
                setExpanded(true);
            } else {
                // Add new comment to the list
                setComments(prevComments => [data, ...prevComments]);
            }

            setNewComment('');
            message.success('Comment posted successfully');
        } catch (error) {
            console.error('Submit comment error:', error);
            message.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikeComment = async (commentId, isLiked) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const method = isLiked ? 'DELETE' : 'POST';
            const response = await fetch(`${API_BASE_URL}/api/likes/comments/${commentId}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isLiked ? 'unlike' : 'like'} comment`);
            }

            // Update comment in state
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            isLiked: !isLiked,
                            _count: {
                                ...comment._count,
                                likes: isLiked
                                    ? comment._count.likes - 1
                                    : comment._count.likes + 1
                            }
                        };
                    }
                    return comment;
                })
            );
        } catch (error) {
            console.error('Like comment error:', error);
            message.error(`Failed to ${isLiked ? 'unlike' : 'like'} comment`);
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment.id);
        setEditText(comment.content);
    };

    const submitEditComment = async () => {
        if (!editText.trim()) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/comments/${editingComment}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: editText })
            });

            if (!response.ok) {
                throw new Error('Failed to update comment');
            }

            const updatedComment = await response.json();

            // Update comment in state
            setComments(prevComments =>
                prevComments.map(comment =>
                    comment.id === editingComment ? updatedComment : comment
                )
            );

            setEditingComment(null);
            setEditText('');
            message.success('Comment updated successfully');
        } catch (error) {
            console.error('Edit comment error:', error);
            message.error('Failed to update comment');
        }
    };

    const showDeleteConfirm = (comment) => {
        setCommentToDelete(comment.id);
        setDeleteModalVisible(true);
    };

    const handleDeleteComment = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/comments/${commentToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            // Remove comment from state
            setComments(prevComments =>
                prevComments.filter(comment => comment.id !== commentToDelete)
            );

            setDeleteModalVisible(false);
            setCommentToDelete(null);
            message.success('Comment deleted successfully');
        } catch (error) {
            console.error('Delete comment error:', error);
            message.error('Failed to delete comment');
        }
    };

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const renderCommentActions = (comment) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const isOwner = user && user.id === comment.userId;

        const actions = [
            <Tooltip key="like" title={comment.isLiked ? "Unlike" : "Like"}>
                <span onClick={() => handleLikeComment(comment.id, comment.isLiked)}>
                    {comment.isLiked ? <HeartFilled /> : <HeartOutlined />}
                    <span style={{ marginLeft: 8 }}>{comment._count.likes}</span>
                </span>
            </Tooltip>
        ];

        if (isOwner) {
            actions.push(
                <Tooltip key="edit" title="Edit">
                    <EditOutlined onClick={() => handleEditComment(comment)} />
                </Tooltip>,
                <Tooltip key="delete" title="Delete">
                    <DeleteOutlined onClick={() => showDeleteConfirm(comment)} />
                </Tooltip>
            );
        }

        return actions;
    };

    return (
        <div className="comment-section">
            {/* Comment input */}
            <div className="comment-input-container">
                <TextArea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    maxLength={500}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmitComment}
                    loading={submitting}
                    disabled={!newComment.trim()}
                />
            </div>

            {/* Toggle comments button */}
            {initialCommentCount > 0 && !expanded && (
                <div className="view-comments-button" onClick={toggleExpanded}>
                    View all {initialCommentCount} comments
                </div>
            )}

            {/* Comments list */}
            {expanded && (
                <div className="comments-list">
                    {loading ? (
                        <div className="comments-loading">
                            <Spin size="small" />
                        </div>
                    ) : (
                        <>
                            <div className="comments-header">
                                <span>{comments.length} Comments</span>
                                <Button type="text" onClick={toggleExpanded}>Hide</Button>
                            </div>
                            <List
                                itemLayout="horizontal"
                                dataSource={comments}
                                renderItem={comment => (
                                    <List.Item actions={renderCommentActions(comment)}>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar>
                                                    {comment.user.username.charAt(0).toUpperCase()}
                                                </Avatar>
                                            }
                                            title={
                                                <div className="comment-header">
                                                    <span className="comment-username">{comment.user.username}</span>
                                                    <span className="comment-time">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            }
                                            description={
                                                editingComment === comment.id ? (
                                                    <div className="edit-comment-container">
                                                        <TextArea
                                                            value={editText}
                                                            onChange={(e) => setEditText(e.target.value)}
                                                            autoSize={{ minRows: 1, maxRows: 4 }}
                                                            maxLength={500}
                                                        />
                                                        <div className="edit-buttons">
                                                            <Button
                                                                size="small"
                                                                onClick={() => setEditingComment(null)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="primary"
                                                                size="small"
                                                                onClick={submitEditComment}
                                                                disabled={!editText.trim()}
                                                            >
                                                                Save
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="comment-content">{comment.content}</div>
                                                )
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </>
                    )}
                </div>
            )}

            {/* Delete confirmation modal */}
            <Modal
                title="Delete Comment"
                open={deleteModalVisible}
                onOk={handleDeleteComment}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default CommentSection;
