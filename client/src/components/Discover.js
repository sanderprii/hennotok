// client/src/components/Discover.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import {
    LaptopOutlined,
    ToolOutlined,
    RocketOutlined,
    DesktopOutlined,
    BarsOutlined,
    CoffeeOutlined,
    VideoCameraOutlined,
    BookOutlined,
    SmileOutlined,
    HeartOutlined,
    StarOutlined
} from '@ant-design/icons';
import '../styles/Discover.css';

const Discover = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/posts/topics');

            if (!response.ok) {
                throw new Error('Failed to fetch topics');
            }

            const data = await response.json();
            setTopics(data);
        } catch (error) {
            console.error('Error fetching topics:', error);
            message.error('Failed to load topics');
        } finally {
            setLoading(false);
        }
    };

    // Get icon for topic
    const getTopicIcon = (topicName) => {
        const iconMap = {
            'Entertainment': <LaptopOutlined />,
            'DIY': <ToolOutlined />,
            'Travelling': <RocketOutlined />,
            'Work': <DesktopOutlined />,
            'Sports': <BarsOutlined />,
            'Cooking': <CoffeeOutlined />,
            'Celebrities': <StarOutlined />,
            'Movies': <VideoCameraOutlined />,
            'Comedy': <SmileOutlined />,
            'Books': <BookOutlined />,
            'Fashion': <HeartOutlined />
        };

        return iconMap[topicName] || <StarOutlined />;
    };

    const handleTopicClick = (topicId) => {
        navigate(`/topic/${topicId}`);
    };

    if (loading) {
        return (
            <div className="discover-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="discover-container">
            <div className="topics-grid">
                {topics.map(topic => (
                    <div
                        key={topic.id}
                        className="topic-card"
                        onClick={() => handleTopicClick(topic.id)}
                    >
                        <div className="topic-icon">
                            {getTopicIcon(topic.name)}
                        </div>
                        <div className="topic-content">
                            <h3 className="topic-title">{topic.name}</h3>
                            <p className="topic-description">
                                {getTopicDescription(topic.name)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper function to get topic descriptions
const getTopicDescription = (topicName) => {
    const descriptions = {
        'Travel': 'Explore amazing destinations',
        'Food': 'Delicious recipes and food hacks',
        'Fitness': 'Workouts and health tips',
        'Pets': 'Cute and funny animals',
        'Fashion': 'Style tips and trends',
        'Technology': 'Tech news and reviews',
        'Art': 'Creative designs and artwork',
        'Music': 'Songs and music videos',
        'Nature': 'Stunning natural landscapes',
        'Gaming': 'Game reviews and gameplay',
        'Entertainment': 'Movies, TV shows & celebrities',
        'DIY': 'Creative crafts and projects',
        'Travelling': 'Explore amazing destinations',
        'Work': 'Career tips and office life',
        'Sports': 'Athletes and sporting events',
        'Cooking': 'Delicious recipes and food hacks',
        'Celebrities': 'Celebrity news and gossip',
        'Movies': 'Film reviews and trailers',
        'Comedy': 'Funny videos and jokes',
        'Books': 'Book reviews and recommendations',
        'Animals': 'Cute and funny animals',
        'Beauty': 'Makeup and beauty tips'
    };

    return descriptions[topicName] || 'Discover amazing content';
};

export default Discover;