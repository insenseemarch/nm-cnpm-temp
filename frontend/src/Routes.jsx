import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';

import Story from './pages/story-overview';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import FamilyAchievements from './pages/family-achievements';
import CalendarEvents from './pages/events';
import Confession from './pages/confession';
import FamilyMembers from './pages/members';
import MemberProfile from 'components/MemberProfile';
import EditMemberPage from './pages/members/components/EditMemberPage';
import UserProfile from './pages/user/UserProfile';

import TreePage from './pages/tree';
import ProtectedRoute from './components/ProtectedRoute';

const Routes = () => {
  return (
    <RouterRoutes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/overview" element={<Story />} />
      <Route path="/" element={<Story />} />
      {/* <Route path="/verify-email" element={<VerifyEmailPage />} /> */} //Không thực hiện chức năng này

      {/* Protected routes */}
      <Route path="/achievements" element={<ProtectedRoute><FamilyAchievements /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><CalendarEvents /></ProtectedRoute>} />
      <Route path="/confessions" element={<ProtectedRoute><Confession /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><FamilyMembers /></ProtectedRoute>} />
      <Route path="/members/:id" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
      <Route path="/members/:id/edit" element={<ProtectedRoute><EditMemberPage /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><TreePage /></ProtectedRoute>} />
      <Route path="/family-tree" element={<ProtectedRoute><TreePage hideActions /></ProtectedRoute>} />
      <Route path="/family-tree/:id" element={<ProtectedRoute><TreePage hideActions /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
    </RouterRoutes>
  );
};

export default Routes;
