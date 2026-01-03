const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const updateTree = async (familyId, data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/families/${familyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update tree');
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Update tree error:', error);
    throw error;
  }
};
import axios from "./axiosClient";

export const getMyTrees = async () => {
  const res = await fetch(`${API_BASE_URL}/trees/my`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const json = await res.json();
  return json.data;
};


export const getTreeDetail = async (treeId) => {
  const res = await axios.get(`/trees/${treeId}`);
  return res.data;
};

export const leaveTree = async (familyId) => {
  const res = await fetch(
    `${API_BASE_URL}/families/${familyId}/leave`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  if (!res.ok) throw new Error("Leave tree failed");
};
