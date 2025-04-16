// client/src/components/CreatePost.js
import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Select, message, Progress, Typography, Alert } from 'antd';
import { UploadOutlined, VideoCameraOutlined, PictureOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/CreatePost.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const CreatePost = () => {
    const [form] = Form.useForm();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [topics, setTopics] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [validationError, setValidationError] = useState(null);
    const [processingWarnings, setProcessingWarnings] = useState([]);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch topics when component mounts
        const fetchTopics = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/posts/topics`);
                const data = await response.json();

                if (response.ok) {
                    setTopics(data);
                } else {
                    message.error('Failed to load topics');
                }
            } catch (error) {
                console.error('Error fetching topics:', error);
                message.error('Failed to connect to server');
            }
        };

        fetchTopics();
    }, []);

    // Cleanup preview URL when component unmounts or file changes
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        setValidationError(null);
        setProcessingWarnings([]);

        if (!selectedFile) return;

        // Check file type
        const isImage = selectedFile.type.startsWith('image');
        const isVideo = selectedFile.type.startsWith('video');

        if (!isImage && !isVideo) {
            setValidationError('Only image and video files are allowed');
            return;
        }

        // Check file size - now just warning instead of error
        if (selectedFile.size > 2 * 1024 * 1024) {
            if (isImage) {
                setProcessingWarnings(prev => [...prev, 'Image is larger than 2MB and will be automatically compressed. Some quality loss may occur.']);
            } else {
                setProcessingWarnings(prev => [...prev, 'Video is larger than 2MB and will be automatically compressed. Some quality loss may occur.']);
            }
        }

        // Show special warning for very large files
        if (selectedFile.size > 200 * 1024 * 1024) {
            setProcessingWarnings(prev => [...prev, 'Your file is very large (over 200MB). Upload and processing may take a long time.']);
        }

        // For videos, check duration - now just warning instead of error
        if (isVideo) {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 60) {
                    setProcessingWarnings(prev => [...prev, `Video is ${Math.round(video.duration)} seconds long and will be trimmed to the first 60 seconds.`]);
                }
                setFile(selectedFile);
                setFileType('video');
            };

            video.src = URL.createObjectURL(selectedFile);
        } else {
            // For images, proceed directly
            setFile(selectedFile);
            setFileType('image');
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl);
    };

    const handleVideoUpload = () => {
        fileInputRef.current.accept = 'video/*';
        fileInputRef.current.click();
    };

    const handleImageUpload = () => {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.click();
    };

    const onFinish = async (values) => {
        if (!file) {
            message.error('Please select a file to upload');
            return;
        }

        if (validationError) {
            message.error(validationError);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            message.error('You must be logged in to create a post');
            navigate('/login');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', values.description || '');
        formData.append('topicId', values.topic);

        try {
            // Create a mock XMLHttpRequest to track upload progress
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_BASE_URL}/api/posts/create`);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentage = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percentage);
                }
            };

            xhr.onload = function() {
                setUploading(false);
                if (xhr.status === 201) {
                    const response = JSON.parse(xhr.responseText);
                    message.success('Post created successfully!');
                    form.resetFields();
                    setFile(null);
                    setPreview(null);
                    setFileType(null);
                    setProcessingWarnings([]);
                    navigate('/profile');
                } else {
                    const errorData = JSON.parse(xhr.responseText);
                    message.error(errorData.error || 'Failed to create post');
                }
            };

            xhr.onerror = function() {
                setUploading(false);
                message.error('Network error occurred');
            };

            xhr.send(formData);
        } catch (error) {
            setUploading(false);
            console.error('Error creating post:', error);
            message.error('Failed to create post');
        }
    };

    return (
        <div className="create-post-container">
            <div className="create-post-content">
                <div className="preview-container">
                    {preview ? (
                        fileType === 'video' ? (
                            <video
                                src={preview}
                                controls
                                className="file-preview"
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="Preview"
                                className="file-preview"
                            />
                        )
                    ) : (
                        <div className="preview-placeholder">
                            <div className="preview-icon">
                                <PictureOutlined />
                            </div>
                            <p>Preview</p>
                        </div>
                    )}
                </div>

                <div className="upload-buttons">
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <Button
                        icon={<VideoCameraOutlined />}
                        type="primary"
                        onClick={handleVideoUpload}
                        className="upload-button video-button"
                        disabled={uploading}
                    >
                        Upload Video
                    </Button>
                    <Button
                        icon={<PictureOutlined />}
                        type="primary"
                        onClick={handleImageUpload}
                        className="upload-button image-button"
                        disabled={uploading}
                    >
                        Upload Image
                    </Button>
                </div>

                {validationError && (
                    <div className="validation-error">
                        {validationError}
                    </div>
                )}

                {processingWarnings.length > 0 && (
                    <div className="processing-warnings">
                        {processingWarnings.map((warning, index) => (
                            <Alert
                                key={index}
                                message="Processing Notice"
                                description={warning}
                                type="warning"
                                showIcon
                                icon={<InfoCircleOutlined />}
                                style={{ marginBottom: '10px' }}
                            />
                        ))}
                    </div>
                )}

                {uploading && (
                    <div className="progress-container">
                        <Progress
                            percent={uploadProgress}
                            status="active"
                            format={percent => (
                                <span>
                                    {percent}% {processingWarnings.length > 0 ? '(Processing...)' : ''}
                                </span>
                            )}
                        />
                    </div>
                )}

                <Form
                    form={form}
                    name="createPost"
                    layout="vertical"
                    onFinish={onFinish}
                    className="post-form"
                >
                    <Form.Item
                        label="Description"
                        name="description"
                        className="form-item-description"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Write a description for your video..."
                            disabled={uploading}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Choose a topic"
                        name="topic"
                        rules={[{ required: true, message: 'Please select a topic' }]}
                        className="form-item-topic"
                    >
                        <Select placeholder="Select a topic" disabled={uploading}>
                            {topics.map(topic => (
                                <Option key={topic.id} value={topic.id}>{topic.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item className="form-item-submit">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="post-button"
                            loading={uploading}
                            disabled={!file || validationError}
                        >
                            ✨ Post ✨
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default CreatePost;