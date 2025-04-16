// client/src/components/Layout.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    HomeOutlined,
    CompassOutlined,
    PlusCircleOutlined,
    InboxOutlined,
    UserOutlined,
    HomeFilled,
    CompassFilled,
    PlusCircleFilled,
    MessageFilled,
    IdcardFilled
} from '@ant-design/icons';
import NotificationCenter from './NotificationCenter';
import '../styles/Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;

    // Define page titles based on current path
    const getPageTitle = () => {
        if (pathname === '/home') return 'Home';
        if (pathname === '/discover') return 'Discover';
        if (pathname === '/create-post') return 'Create New Post';
        if (pathname === '/inbox') return 'Inbox';
        if (pathname === '/profile') return 'My Profile';
        return '';
    };

    // Check if path is active for styling
    const isActive = (path) => {
        return pathname === path;
    };

    // Navigation handlers
    const navigateTo = (path) => {
        navigate(path);
    };

    return (
        <div className="app-layout">
            {/* Top Navigation Bar */}
            <div className="top-navbar">
                <div className="navbar-left">
                    {pathname === '/create-post' && (
                        <button
                            className="back-button"
                            onClick={() => navigate(-1)}
                        >
                            ←
                        </button>
                    )}
                    <div className="navbar-title">{getPageTitle()}</div>
                </div>
                <div className="navbar-right">
                    {pathname !== '/login' && pathname !== '/signup' && (
                        <NotificationCenter />
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {children}
            </div>

            {/* Bottom Navigation Bar */}
            <div className="bottom-navbar">
                <div
                    className={`nav-item ${isActive('/home') ? 'active' : ''}`}
                    onClick={() => navigateTo('/home')}
                >
                    {isActive('/home') ? <HomeFilled /> : <HomeOutlined />}
                    <div className="nav-label">Home</div>
                </div>
                <div
                    className={`nav-item ${isActive('/discover') ? 'active' : ''}`}
                    onClick={() => navigateTo('/discover')}
                >
                    {isActive('/discover') ? <CompassFilled /> : <CompassOutlined />}
                    <div className="nav-label">Discover</div>
                </div>
                <div
                    className={`nav-item ${isActive('/create-post') ? 'active' : ''}`}
                    onClick={() => navigateTo('/create-post')}
                >
                    {isActive('/create-post') ? <PlusCircleFilled /> : <PlusCircleOutlined />}
                    <div className="nav-label">Create</div>
                </div>
                <div
                    className={`nav-item ${isActive('/inbox') ? 'active' : ''}`}
                    onClick={() => navigateTo('/inbox')}
                >
                    {isActive('/inbox') ? <MessageFilled /> : <InboxOutlined />}
                    <div className="nav-label">Inbox</div>
                </div>
                <div
                    className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
                    onClick={() => navigateTo('/profile')}
                >
                    {isActive('/profile') ? <IdcardFilled /> : <UserOutlined />}
                    <div className="nav-label">Me</div>
                </div>
            </div>
        </div>
    );
};

export default Layout;