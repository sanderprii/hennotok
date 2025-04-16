// client/src/components/NotificationCenter.js
import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Avatar, Button, Empty, Spin, message } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import '../styles/NotificationCenter.css';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch notifications when dropdown is opened
    useEffect(() => {
        if (dropdownOpen) {
            fetchNotifications();
        }
    }, [dropdownOpen]);

    // Fetch notifications periodically (every 30 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            if (localStorage.getItem('token')) {
                fetchUnreadCount();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Initial fetch of unread count
    useEffect(() => {
        if (localStorage.getItem('token')) {
            fetchUnreadCount();
        }
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:5000/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Fetch unread count error:', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication required');
                return;
            }

            const response = await fetch('http://localhost:5000/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Fetch notifications error:', error);
            message.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            // Update notification in state
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, read: true } 
                        : notification
                )
            );

            // Update unread count
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:5000/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }

            // Update all notifications in state
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => ({ ...notification, read: true }))
            );

            // Reset unread count
            setUnreadCount(0);
            message.success('All notifications marked as read');
        } catch (error) {
            console.error('Mark all as read error:', error);
            message.error('Failed to mark all notifications as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            // Remove notification from state
            const deletedNotification = notifications.find(n => n.id === notificationId);
            setNotifications(prevNotifications => 
                prevNotifications.filter(notification => notification.id !== notificationId)
            );

            // Update unread count if the deleted notification was unread
            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prevCount => Math.max(0, prevCount - 1));
            }
        } catch (error) {
            console.error('Delete notification error:', error);
            message.error('Failed to delete notification');
        }
    };

    const handleNotificationClick = (notification) => {
        // Mark as read
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.type === 'like' || notification.type === 'comment') {
            // Navigate to the post
            // This would need to be implemented based on your app's routing
            // navigate(`/post/${notification.postId}`);
        } else if (notification.type === 'follow') {
            // Navigate to the user's profile
            navigate(`/profile/${notification.senderId}`);
        }

        // Close dropdown
        setDropdownOpen(false);
    };

    const getNotificationContent = (notification) => {
        const senderName = notification.sender.username;
        
        switch (notification.type) {
            case 'like':
                return `${senderName} liked your post`;
            case 'comment':
                return `${senderName} commented on your post`;
            case 'commentLike':
                return `${senderName} liked your comment`;
            case 'reply':
                return `${senderName} replied to your comment`;
            case 'follow':
                return `${senderName} started following you`;
            default:
                return `New notification from ${senderName}`;
        }
    };

    const notificationMenu = (
        <div className="notification-dropdown">
            <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                    <Button 
                        type="text" 
                        size="small" 
                        onClick={markAllAsRead}
                    >
                        Mark all as read
                    </Button>
                )}
            </div>
            
            {loading ? (
                <div className="notification-loading">
                    <Spin size="small" />
                </div>
            ) : notifications.length === 0 ? (
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="No notifications yet" 
                />
            ) : (
                <List
                    className="notification-list"
                    itemLayout="horizontal"
                    dataSource={notifications}
                    renderItem={notification => (
                        <List.Item
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            actions={[
                                !notification.read && (
                                    <Button
                                        key="read"
                                        type="text"
                                        size="small"
                                        icon={<CheckOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                        }}
                                    />
                                ),
                                <Button
                                    key="delete"
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                    }}
                                />
                            ].filter(Boolean)}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar>
                                        {notification.sender.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                }
                                title={getNotificationContent(notification)}
                                description={formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );

    return (
        <Dropdown
            overlay={notificationMenu}
            trigger={['click']}
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            placement="bottomRight"
            arrow
        >
            <Badge count={unreadCount} overflowCount={99}>
                <Button
                    type="text"
                    icon={<BellOutlined />}
                    className="notification-button"
                />
            </Badge>
        </Dropdown>
    );
};

export default NotificationCenter;
