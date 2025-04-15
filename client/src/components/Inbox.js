// client/src/components/Inbox.js
import React from 'react';
import { Empty } from 'antd';
import '../styles/Inbox.css';

const Inbox = () => {
    return (
        <div className="inbox-container">
            <div className="inbox-content">
                <Empty
                    description="No messages yet"
                    className="empty-inbox"
                />
                <p className="inbox-message">
                    Message functionality will be implemented in a future update.
                </p>
            </div>
        </div>
    );
};

export default Inbox;