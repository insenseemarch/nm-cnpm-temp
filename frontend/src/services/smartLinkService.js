const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const getAuthToken = () => localStorage.getItem("token");

export const getSmartLinkSuggestions = async (treeId) => {
  // Mock response for testing
  if (treeId === 'mocktest') {
    return {
      user: { name: 'Nguyễn Văn A', email: 'a@gmail.com' },
      autoMatch: {
        found: true,
        member: { id: 'member_123', name: 'Nguyễn Văn A', email: 'a@gmail.com' },
      },
      possibleMatches: [
        { id: 'member_456', name: 'Nguyễn Văn An', similarity: 0.85 },
        { id: 'member_789', name: 'Nguyễn A', similarity: 0.72 },
      ],
    };
  }

  const res = await fetch(
    `${API_BASE_URL}/trees/${treeId}/smart-link/suggestions`,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to get smart link suggestions");
  return res.json();
};

export const approveSmartLink = async (treeId, payload) => {
  if (treeId === 'mocktest') {
    // simulate approve
    return { message: 'approved (mock)' };
  }

  const res = await fetch(
    `${API_BASE_URL}/trees/${treeId}/smart-link/approve`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Failed to approve smart link");
  return res.json();
};
