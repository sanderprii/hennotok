// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Home from './components/Home';
import Discover from './components/Discover';
import TopicPosts from './components/TopicPosts';
import CreatePost from './components/CreatePost';
import Inbox from './components/Inbox';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import PostDetail from './components/PostDetail';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />

                    {/* Protected routes with the new layout */}
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Home />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/discover"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Discover />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/topic/:topicId"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <TopicPosts />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create-post"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <CreatePost />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/inbox"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Inbox />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Profile />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile/:userId"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <UserProfile />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/post/:postId"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <PostDetail />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirect old dashboard path to Home */}
                    <Route
                        path="/dashboard"
                        element={<Navigate to="/home" replace />}
                    />

                    {/* Default routes */}
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;