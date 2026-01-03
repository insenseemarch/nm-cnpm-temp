import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/cosmic-family-tree.css";

import FamilyTreeChart from "./FamilyTreeChart";
import AddMemberForm from "../../members/components/AddMemberForm";
import EditMemberModal from "./editMemberModal";
import ConfirmIsMeModal from "./confirmIsMeModal";
import SmartLinkModal from "../../../components/smart-link/smartLinkModal";
import CreateTreeModal from "./createTreeModal";
import EditTreeModal from "./editTreeModal";
import JoinTreeModal from "./joinTreeModal";
import DeleteTreeModal from "./deleteTreeModal";

import { getTreeDetail, leaveTree, updateTree } from "../../../services/treeService";
import { getFamilyById, deleteFamily } from "../../../services/familyService";
import {
  updateMember,
  deleteMember,
  createMember,
  transformMemberData,
  getMembers,
} from "../../../services/memberService";
import { getFamilies, setCurrentFamilyId, getCurrentFamilyId } from "../../../services/familyService";
import {
  getSmartLinkSuggestions,
  approveSmartLink,
} from "../../../services/smartLinkService";

// Build tree from flat member array (convert BE format to mock format)
function buildTreeFromMembers(members) {
  if (!Array.isArray(members)) return [];

  // Build id->member map for fast lookup
  const idMap = {};
  members.forEach(m => { if (m && m.id) idMap[m.id] = m; });

  return members
    .filter(m => m && m.id)
    .map(m => {
      // Build rels like mock
      const rels = {};
      // Parents
      if (m.fatherId || m.motherId) {
        rels.parents = [m.fatherId, m.motherId].filter(Boolean);
      }
      // Spouses: luôn để spouse mới (id lớn nhất hoặc mới nhất) nằm bên phải
      if (m.spouseId) {
        // Nếu có nhiều spouse, sắp xếp theo id tăng dần (hoặc có thể dùng createdAt nếu muốn)
        rels.spouses = [m.spouseId];
      }
      // Children: find all members whose fatherId/motherId is this member
      const children = members.filter(child => child.fatherId === m.id || child.motherId === m.id).map(child => child.id);
      if (children.length > 0) {
        rels.children = children;
      }
      // Đảm bảo spouse luôn nằm bên phải nếu có
      if (rels.spouses && rels.spouses.length > 1) {
        rels.spouses.sort(); // id tăng dần, spouse mới thường có id lớn hơn
      }
      return {
        id: m.id,
        data: {
          ...m,
        },
        rels,
      };
    });
}


const TreeViewer = ({ treeId, showActions = true }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState(null);
  const [familyInfo, setFamilyInfo] = useState(null);

  // ===== TREE ACTION UI =====
  const [showCreateTree, setShowCreateTree] = useState(false);
  const [showJoinTree, setShowJoinTree] = useState(false);

  const [newTreeName, setNewTreeName] = useState("");
  const [newTreeDesc, setNewTreeDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Families list (shown under buttons)
  const [families, setFamilies] = useState([]);
  const [familiesLoading, setFamiliesLoading] = useState(false);
  
  // Context menu for setting default family
  const [contextMenu, setContextMenu] = useState(null);
  const [activeFamilyId, setActiveFamilyId] = useState(getCurrentFamilyId());

  // Editable title/subtitle for current family (persisted per familyId)
  const [treeTitle, setTreeTitle] = useState('Khởi nguyên của vũ trụ');
  const [treeSubtitle, setTreeSubtitle] = useState('Lưu trữ lịch sử trăm năm của gia tộc');
  
  // Unified Edit/Delete Modal state
  const [showEditTreeModal, setShowEditTreeModal] = useState(false);
  const [showDeleteTreeModal, setShowDeleteTreeModal] = useState(false);

  // Load title/subtitle depending on page context (explore vs family view)
  useEffect(() => {
    // If we're on the explore page (showActions true), always show the global defaults
    if (showActions) {
      setTreeTitle('Khởi nguyên của vũ trụ');
      setTreeSubtitle('Lưu trữ lịch sử trăm năm của gia tộc');
      return;
    }

    if (!treeId) {
      setTreeTitle('Khởi nguyên của vũ trụ');
      setTreeSubtitle('Lưu trữ lịch sử trăm năm của gia tộc');
      return;
    }

    const storedTitle = localStorage.getItem(`familyTitle_${treeId}`);
    const storedSub = localStorage.getItem(`familySubtitle_${treeId}`);

    if (storedTitle) setTreeTitle(storedTitle);
    else setTreeTitle('Khởi nguyên của vũ trụ');

    if (storedSub) setTreeSubtitle(storedSub);
    else setTreeSubtitle('Lưu trữ lịch sử trăm năm của gia tộc');
  }, [treeId, showActions]);


  const handleUpdateTree = async (updatedTree) => {
    if (!updatedTree) return;
    setTreeTitle(updatedTree.name);
    setTreeSubtitle(updatedTree.description);
    
    // Update local storage
    try {
      localStorage.setItem(`familyTitle_${treeId}`, updatedTree.name);
      localStorage.setItem(`familySubtitle_${treeId}`, updatedTree.description);
    } catch (e) {
      console.error(e);
    }
  };

  const executeDeleteTree = async () => {
    try {
      await deleteFamily(treeId);
      
      // Clean up localStorage
      localStorage.removeItem(`familyTitle_${treeId}`);
      localStorage.removeItem(`familySubtitle_${treeId}`);
      localStorage.removeItem(`isMe_${treeId}`);
      
      // If deleted tree was current, remove it
      if (getCurrentFamilyId() === treeId) {
        localStorage.removeItem('currentFamilyId');
      }
      
      setShowDeleteTreeModal(false);
      navigate('/explore');
    } catch (err) {
      console.error('Delete tree error:', err);
      // Let the modal handle the error display if needed, but for now just logging
      throw err;
    }
  };

  // Thay thế useEffect lấy danh sách cây đã tham gia
  useEffect(() => {
    if (!showActions) return;
    let mounted = true;
    const fetchFamilies = async () => {
      setFamiliesLoading(true);
      try {
        const families = await getFamilies();
        if (mounted) setFamilies(families || []);
      } catch (err) {
        console.error('Failed to load families', err);
        if (mounted) setFamilies([]);
      } finally {
        if (mounted) setFamiliesLoading(false);
      }
    };
    fetchFamilies();
    return () => { mounted = false; };
  }, [showActions]);

  // Close editors when switching to Explore (showActions=true)
  useEffect(() => {
    if (showActions) {
      setShowEditTreeModal(false);
    }
  }, [showActions]);

  // ===== ADD MEMBER =====
  const [showAddForm, setShowAddForm] = useState(false);
  const [formInitialData, setFormInitialData] = useState(null);

  // isMe
  const [pendingMemberData, setPendingMemberData] = useState(null);
  const [showIsMeModal, setShowIsMeModal] = useState(false);

  // Focus member after creation
  const [focusMemberId, setFocusMemberId] = useState(null);
  // isMe memberId (localStorage)
  const [isMeMemberId, setIsMeMemberId] = useState(null);

  // edit member
  const [selectedMember, setSelectedMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // smart link
  const [showSmartLink, setShowSmartLink] = useState(false);
  const [smartLinkData, setSmartLinkData] = useState(null);


  // ALWAYS auto-detect isMe from API, không dùng localStorage
  useEffect(() => {
    if (!showActions && treeId) {
      // Reset khi đổi cây
      setIsMeMemberId(null);
    }
  }, [treeId, showActions]);

  useEffect(() => {
    if (treeId) {
      fetchTree();
      fetchFamilyInfo();
    }
  }, [treeId]);




  const fetchTree = async () => {
    setLoading(true);
    try {
      // Lấy danh sách member từ API chuẩn
      const members = await getMembers(treeId);
      const membersRaw = members
        .map(transformMemberData)
        .filter(Boolean);
      const tree = buildTreeFromMembers(membersRaw);
      setTreeData(tree);
      
      // ALWAYS auto-detect isMe member từ linkedUserId
      if (!showActions) {
        const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
        if (currentUserId) {
          const myMember = members.find(m => m.linkedUserId === currentUserId);
          if (myMember) {
            setIsMeMemberId(myMember.id);
            console.log('[Auto-detected isMe member]:', myMember.id);
          } else {
            setIsMeMemberId(null);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyInfo = async () => {
    if (!treeId) return;
    try {
      const family = await getFamilyById(treeId);
      setFamilyInfo(family);
    } catch (err) {
      console.error('Failed to fetch family info:', err);
    }
  };


  // ===== ADD MEMBER FLOW =====
  // Khi bấm dấu + trên node, mở form nhập thông tin thành viên
  const handleNodeAction = (action, nodeId) => {
    const member = treeData.find((m) => m.id === nodeId);
    if (!member) return;

    if (action === "add_spouse") {
      // Thêm vợ/chồng: mở form, khi submit sẽ cập nhật spouseId cho cả hai
      setFormInitialData({
        oldMemberName: member.data.name,
        relation: member.data.gender === "M" ? "Vợ" : member.data.gender === "F" ? "Chồng" : "Vợ/Chồng",
        spouseOfId: member.id, // dùng để cập nhật spouseId sau khi tạo
      });
      setShowAddForm(true);
      return;
    }

    if (action === "add_child") {
      // Thêm con: tự động set fatherId/motherId dựa vào giới tính của member và spouse nếu có
      let fatherId = null, motherId = null;
      console.log('[DEBUG] add_child - member.data:', member.data);
      const genderValue = (x) => (x || '').toLowerCase();
      if (genderValue(member.data.gender) === "m" || genderValue(member.data.gender) === "male") {
        fatherId = member.id;
        if (member.data.spouseId) {
          const spouse = treeData.find(m => m.id === member.data.spouseId);
          console.log('[DEBUG] add_child - spouse:', spouse ? spouse.data : null);
          if (spouse && genderValue(spouse.data.gender) === "f" || genderValue(spouse.data.gender) === "female") {
            motherId = spouse.id;
          }
        }
      } else if (genderValue(member.data.gender) === "f" || genderValue(member.data.gender) === "female") {
        motherId = member.id;
        if (member.data.spouseId) {
          const spouse = treeData.find(m => m.id === member.data.spouseId);
          console.log('[DEBUG] add_child - spouse:', spouse ? spouse.data : null);
          if (spouse && genderValue(spouse.data.gender) === "m" || genderValue(spouse.data.gender) === "male") {
            fatherId = spouse.id;
          }
        }
      }
      setFormInitialData({
        oldMemberName: member.data.name,
        relation: "Con",
        fatherId,
        motherId,
      });
      setShowAddForm(true);
      return;
    }
  };


  // Khi submit form, lưu dữ liệu và mở modal xác nhận isMe
  const handleAddMemberSubmit = (data) => {
    // Nếu là thêm vợ/chồng, lưu lại spouseOfId để sau khi tạo sẽ update hai chiều
    setPendingMemberData(data);
    setShowAddForm(false);
    setShowIsMeModal(true);
  };


  // Khi xác nhận isMe, gửi dữ liệu lên backend và reload cây
  const handleConfirmIsMe = async (isMe) => {
    try {
      console.log('[DEBUG] pendingMemberData on isMe:', pendingMemberData);
      const created = await createMember(treeId, { ...pendingMemberData, isMe });
      // Nếu là thêm vợ/chồng, cập nhật spouseId hai chiều
      if (pendingMemberData && pendingMemberData.spouseOfId && created && created.id) {
        // Cập nhật spouseId cho member vừa tạo
        try {
          console.log('[DEBUG] updateMember (new spouse):', created.id, '->', pendingMemberData.spouseOfId);
          const res1 = await updateMember(treeId, created.id, { spouseId: pendingMemberData.spouseOfId });
          console.log('[DEBUG] updateMember (new spouse) result:', res1);
        } catch (err) {
          console.error('Lỗi khi cập nhật spouseId cho member mới:', err);
          alert('Lỗi khi cập nhật spouseId cho member mới: ' + (err.message || ''));
        }
        // Cập nhật spouseId cho member gốc
        try {
          console.log('[DEBUG] updateMember (origin spouse):', pendingMemberData.spouseOfId, '->', created.id);
          const res2 = await updateMember(treeId, pendingMemberData.spouseOfId, { spouseId: created.id });
          console.log('[DEBUG] updateMember (origin spouse) result:', res2);
        } catch (err) {
          console.error('Lỗi khi cập nhật spouseId cho member gốc:', err);
          alert('Lỗi khi cập nhật spouseId cho member gốc: ' + (err.message || ''));
        }
        // Sau khi cập nhật spouseId hai chiều, reload lại cây
        await fetchTree();
      }
      setPendingMemberData(null);
      setShowIsMeModal(false);

      // fetchTree sẽ tự auto-detect lại isMe member, không cần localStorage
      // Luôn cập nhật lại treeData sau khi tạo member (dù isMe true/false)
      if (created && created.id) {
        await fetchTree(); // Sẽ auto-detect isMe
        setFocusMemberId(created.id);
        setTimeout(() => setFocusMemberId(null), 3500);
      }
    } catch (err) {
      console.error('Failed to create member:', err);
      alert(err.message || 'Thêm thành viên thất bại');
    }
  };

  // ===== EDIT / DELETE =====
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowEditModal(true);
    // Nếu chưa có isMeMemberId, mỗi lần admin thêm thành viên mới sẽ hỏi lại isMe
    if (!isMeMemberId) {
      setTimeout(() => setShowIsMeModal(true), 300);
    }
  };

  const handleUpdateMember = async (data) => {
    await updateMember(treeId, selectedMember.id, data);
    setShowEditModal(false);
    setSelectedMember(null);
    fetchTree();
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Xoá thành viên này?")) return;
    await deleteMember(treeId, id);
    fetchTree();
  };

  // ===== SMART LINK =====
  const handleOpenSmartLink = async () => {
    setSmartLinkData(await getSmartLinkSuggestions(treeId));
    setShowSmartLink(true);
  };

  const handleApproveSmartLink = async (payload) => {
    await approveSmartLink(treeId, payload);
    setShowSmartLink(false);
    fetchTree();
  };

  return (
    <div className="relative min-h-[800px]">

      {/* LOADING */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </div>
      )}

      {/* MAIN */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">

          {/* TITLE & SUBTITLE */}
          <motion.div
            className="text-center mb-8 relative group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
             {/* BACK BUTTON (Only visible when not in Explore mode) */}
             {!showActions && (
              <div className="absolute top-0 left-0">
                 <button 
                  onClick={() => navigate('/explore')}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                  title="Quay lại trang khám phá"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              </div>
             )}

             {/* EDIT AND DELETE BUTTON (Only visible for admin when not in Explore mode) */}
             {!showActions && familyInfo && familyInfo.adminId === JSON.parse(localStorage.getItem('user') || '{}').id && (
              <div className="absolute top-0 right-0 flex items-center gap-2">
                 <button 
                  onClick={() => setShowEditTreeModal(true)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all group-hover:opacity-100 opacity-0 md:opacity-100"
                  title="Chỉnh sửa thông tin cây"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </button>
                 <button 
                  onClick={() => setShowDeleteTreeModal(true)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-red-400 transition-all group-hover:opacity-100 opacity-0 md:opacity-100"
                  title="Xóa cây gia phả"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
             )}

             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-cosmic-glow font-accent mb-4">
               <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent px-4 py-1">
                 {treeTitle}
               </span>
             </h1>
             <div className="w-48 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-4" />
             
             <p className="text-lg md:text-xl text-primary-foreground font-light opacity-80 max-w-2xl mx-auto px-4">
               {treeSubtitle}
             </p>
          </motion.div>



          {/* ACTION BUTTONS */}
          {showActions && (
            <>
            <motion.div
                  className="floating-content rounded-xl w-max mx-auto px-6 py-3 mb-4 backdrop-blur-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setShowCreateTree(true)}
                  className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-secondary to-accent transition-all duration-200 hover:scale-105"
                >
                  Tạo cây
                </button>
                <button
                  onClick={() => setShowJoinTree(true)}
                  className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-accent to-secondary transition-all duration-200 hover:scale-105"
                >
                  Gia nhập cây
                </button>
              </div>
            </motion.div>

            {/* Family list */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-sm text-white/80 mb-2">
                Danh sách các cây đang tham gia
              </div>

              {familiesLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : families.length ? (
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {families.map((f) => {
                    const isActive = activeFamilyId === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          // Lưu familyId hiện tại và điều hướng sang trang chi tiết cây
                          setCurrentFamilyId(f.id);
                          setActiveFamilyId(f.id);
                          navigate(`/family-tree/${f.id}`);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            familyId: f.id,
                            familyName: f.name || `Cây gia phả #${f.id}`
                          });
                        }}
                        className={`px-4 py-2 rounded-2xl mt-5 bg-card/40 text-white/90 transition-all duration-200 active:scale-95 hover:scale-105 ${
                          isActive ? 'border-2 border-accent' : 'border border-accent/20'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{f.name || `Cây gia phả #${f.id}`}</span>
                          <span className="text-[12px] text-white/40">#{f.id}</span>
                        </div>
                      </button>
                    );
                  })}

                </div>
              ) : (
                <div className="text-sm text-white/60">
                  Chưa có cây gia phả nào. Hãy tạo hoặc gia nhập một cây để bắt đầu!
                </div>
              )}
            </motion.div>

            {/* Context Menu */}
            {contextMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setContextMenu(null)}
                />
                <div
                  className="fixed z-50 bg-zinc-900/95 backdrop-blur-md border border-accent/30 rounded-lg shadow-2xl py-1 min-w-[200px]"
                  style={{
                    left: `${contextMenu.x}px`,
                    top: `${contextMenu.y}px`,
                  }}
                >
                  <div className="px-3 py-2 text-xs text-white/50 border-b border-white/10">
                    {contextMenu.familyName}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentFamilyId(contextMenu.familyId);
                      setActiveFamilyId(contextMenu.familyId);
                      setContextMenu(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-accent/20 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                    Đặt làm cây mặc định
                  </button>
                </div>
              </>
            )}

            </>
          )}

          {/* CREATE / JOIN MODALS */}
          {showActions && showCreateTree && (
            <CreateTreeModal
              onClose={() => setShowCreateTree(false)}
              onCreated={(family) => {
                // After creating a family, set it as current
                setCurrentFamilyId(family.id);

                // Persist family title/subtitle so the family view displays name/desc we entered
                try {
                  localStorage.setItem(`familyTitle_${family.id}`, family.name || '');
                  localStorage.setItem(`familySubtitle_${family.id}`, family.description || '');
                } catch (err) {
                  // ignore localStorage errors
                }

                // Also reflect immediately in current UI state
                setTreeTitle(family.name || 'Khởi nguyên của vũ trụ');
                setTreeSubtitle(family.description || 'Lưu trữ lịch sử trăm năm của gia tộc');

                setShowCreateTree(false);
                // Navigate to family view where we will immediately open the Add Member form
                navigate(`/family-tree/${family.id}`);
                // Defer opening the add form slightly to let the route mount
                setTimeout(() => setShowAddForm(true), 200);
              }}
            />
          )}

          {showActions && showJoinTree && (
            <JoinTreeModal
              onClose={() => setShowJoinTree(false)}
              onJoined={(req) => {
                console.log('Join request created', req);
              }}
            />
          )}
        </div>

        {/* FULL-WIDTH TREE SECTION (outside centered container) */}
        {/* Show full tree only when in family view (showActions === false). On explore page we keep only the family buttons above. */}
        {!loading &&
          Array.isArray(treeData) &&
          treeData.length > 0 &&
          !showActions && (
            <section className="w-full mt-6 px-6">
              <div className={`relative w-full max-w-none mx-auto h-[calc(100vh-260px)] min-h-[680px] bg-card/30 backdrop-blur-sm rounded-2xl border ${isMeMemberId ? 'border-accent' : 'border-accent/20'} overflow-visible`}>
                <FamilyTreeChart
                  data={treeData}
                  onNodeAction={handleNodeAction}
                  onEditMember={handleEditMember}
                  onDeleteMember={handleDeleteMember}
                  isAdding={showAddForm}
                  isBlocking={showIsMeModal}
                  focusMemberId={focusMemberId}
                  isMeMemberId={isMeMemberId}
                />
              </div>
            </section>
        )}

      </main>

      {/* MODALS */}
      {showAddForm && (
        <AddMemberForm
          initialData={formInitialData}
          onSubmit={handleAddMemberSubmit}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {showEditModal && selectedMember && (
        <EditMemberModal
          member={selectedMember}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateMember}
        />
      )}

      <ConfirmIsMeModal
        open={showIsMeModal}
        onConfirm={handleConfirmIsMe}
        onCancel={() => setShowIsMeModal(false)}
      />

      {showEditTreeModal && createPortal(
        <EditTreeModal
          tree={{ id: treeId, name: treeTitle, description: treeSubtitle }}
          onUpdated={handleUpdateTree}
          onClose={() => setShowEditTreeModal(false)}
        />,
        document.body
      )}

      {showDeleteTreeModal && createPortal(
        <DeleteTreeModal
          treeName={treeTitle}
          onDelete={executeDeleteTree}
          onClose={() => setShowDeleteTreeModal(false)}
        />,
        document.body
      )}

      <SmartLinkModal
        open={showSmartLink}
        data={smartLinkData}
        onSubmit={handleApproveSmartLink}
        onClose={() => setShowSmartLink(false)}
      />
      </div>
  );
};

export default TreeViewer;
