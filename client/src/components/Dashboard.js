import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Layout, message } from 'antd';
import '../styles/Dashboard.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
    const [user, setUser] = useState(null);
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
    }, [navigate]);

    const handleLogout = () => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        message.success('Logged out successfully');
        navigate('/login');
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
                <Title level={2}>Dashboard</Title>
                <div className="content-box">
                    <p>You have successfully logged in to your account!</p>
                    <p>This is your personal dashboard where you can manage your account and activities.</p>
                </div>
            </Content>
        </Layout>
    );
};

export default Dashboard;