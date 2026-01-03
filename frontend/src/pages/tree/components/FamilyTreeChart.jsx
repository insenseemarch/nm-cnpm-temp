import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import * as f3 from 'family-chart';

const FamilyTreeChart = ({
  data,
  onNodeAction,
  onEditMember,
  onDeleteMember,
  onLoaded,
  isAdding = false,
  isBlocking = false,
  focusMemberId = null,
  isMeMemberId = null,
}) => {
  const treeRef = useRef(null);
  const navigate = useNavigate();
  // Refs for overlay synchronization
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const animationFrameId = useRef(null);

  // State to track the currently selected node for the overlay
  const [activeNode, setActiveNode] = useState(null);
  // { id, gender, member }

  useEffect(() => {
    if (!treeRef.current || !data || !Array.isArray(data) || data.length === 0) {
      return;
    }

    // Defensive: check if all nodes have id and data
    const hasInvalidNode = data.some(
      n => !n || typeof n !== 'object' || !('id' in n) || !('data' in n)
    );
    if (hasInvalidNode) {
      console.warn('[FamilyTreeChart] Invalid node(s) detected in data:', data);
      return;
    }

    // Bridge for HTML interactions: handles toggle and navigation
    window.treeActionHandler = (nodeId, action, gender) => {
      console.log('[treeActionHandler]', { nodeId, action, gender });
      // Feature: Navigate on avatar click
      if (action === 'navigate') {
        console.log(`[Feature] Navigate to member profile: ${nodeId}`);
        navigate(`/members/${nodeId}`);
        return;
      }

      // Toggle overlay state
      const member = data.find((m) => m.id === nodeId);

      setActiveNode((prev) => {
        if (prev && prev.id === nodeId) return null;
        return { id: nodeId, gender, member };
      });
    };

    // Defensive: ensure all nodes have father/mother fields (even if null)
    const safeData = Array.isArray(data)
      ? data
          .filter(n => n && n.id)
          .map(n => ({
              ...n,
              father: n.father ?? null,
              mother: n.mother ?? null,
          }))
      : [];

    const chart = f3.createChart(treeRef.current, safeData);

    // Configure card HTML with custom styling
    chart
      .setCardHtml()
      .setCardDisplay([['name'], ['birthday']])
      .setCardDim({ w: 160, h: 200 })
      .setCardInnerHtmlCreator((d) => {
        const getGenderColor = (gender) => {
          // Normalize gender to F/M/other (accepts 'female', 'FEMALE', 'F', ...)
          let g = gender;
          if (typeof g === 'string') {
            g = g.trim().toUpperCase();
            if (g === 'FEMALE' || g === 'F') g = 'F';
            else if (g === 'MALE' || g === 'M') g = 'M';
            else g = 'other';
          }
          const colors = {
            F: 'rgba(244, 114, 182, 0.25)', // pink solid background
            M: 'rgba(114, 233, 251, 0.2)', // blue solid background
            other: 'rgba(168, 85, 247, 0.2)', // purple solid background
          };
          return colors?.[g] || colors.other;
        };

        const getGenderAccent = (gender) => {
          // Normalize gender to F/M/other (accepts 'female', 'FEMALE', 'F', ...)
          let g = gender;
          if (typeof g === 'string') {
            g = g.trim().toUpperCase();
            if (g === 'FEMALE' || g === 'F') g = 'F';
            else if (g === 'MALE' || g === 'M') g = 'M';
            else g = 'other';
          }
          const accents = {
            F: '#f9a8d4', // pink-300
            M: '#60a5fa', // blue-400
            other: '#a78bfa', // purple-400
          };
          return accents?.[g] || accents.other;
        };

        // Highlight node nếu là isMeMemberId
        const uId = d.data.id || d.id;
        const isMe = isMeMemberId && String(isMeMemberId) === String(uId);
        // Make isMe card different
        const borderStyle = isMe
          ? '2px solid rgba(114, 233, 251, 1)' // Thicker + brighter for isMe
          : '1px solid rgba(114, 233, 251, 0.7)';
        const isMeClass = isMe ? 'is-me-card' : '';

        const currentYear = new Date().getFullYear();
        let birthYear = null;
        if (d.data.data.birthYear) {
          const parsed = parseInt(d.data.data.birthYear);
          if (!isNaN(parsed)) birthYear = parsed;
        }
        if (!birthYear && d.data.data.birthDate) {
          const dateObj = new Date(d.data.data.birthDate);
          if (!isNaN(dateObj.getTime())) birthYear = dateObj.getFullYear();
        }
        if (!birthYear && d.data.data.birthday) {
          const parsed = parseInt(d.data.data.birthday);
          if (!isNaN(parsed)) birthYear = parsed;
        }
        const deathYear = d.data.data.deathYear ? parseInt(d.data.data.deathYear) : null;
        let age = null;
        if (birthYear !== null && !isNaN(birthYear)) {
          if (deathYear && !isNaN(deathYear)) {
            age = deathYear - birthYear;
          } else {
            age = currentYear - birthYear;
          }
        }
        const isDeceased = !!deathYear;
        const gender = d.data.data.gender;

        return `
          <div id="card-${uId}"
            data-member-id="${uId}"
            onclick="event.stopPropagation(); window.treeActionHandler('${uId}', 'toggle', '${gender}')"
            class="cosmic-family-card ${isMeClass}" style="
            border-radius: 16px;
            padding: 16px;
            border: ${borderStyle};
            ${isMe ? 'box-shadow: 0 0 24px 4px rgba(114, 233, 251, 0.8), 0 0 12px 6px rgba(114, 233, 251, 0.6), inset 0 0 20px rgba(114, 233, 251, 0.1) !important;' : ''}
            backdrop-filter: blur(12px);
            position: relative;
            color: white;
            min-height: 200px;
            width: 160px;
            cursor: pointer;
            box-sizing: border-box;
            transition: border-color 0.2s;
            ${isDeceased ? 'opacity: 0.7; filter: grayscale(70%);' : ''}
          ">
            <style>
                #card-${uId}:hover { border-color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.05); }
            </style>
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 8px;">
              <div 
                onclick="event.stopPropagation(); if (event.detail === 2) { window.treeActionHandler('${uId}', 'navigate') }"
                title="Mở hồ sơ (nhấp đúp)"
                style="
                width: 75px;
                height: 75px;
                border-radius: 50%;
                padding: 4px;
                background: ${getGenderAccent(d.data.data.gender)};
                margin-bottom: 12px;
                cursor: pointer;
                position: relative; z-index: 10;
              ">
                <div style="
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;
                  overflow: hidden;
                  background: #000;
                ">
                  <img
                    src="${d.data.data.avatar || '/api/placeholder/64/64'}"
                    alt="${d.data.data.name}"
                    style="width: 100%; height: 100%; object-fit: cover; object-position: center; border-radius: 50%; ${isDeceased ? 'filter: grayscale(50%);' : ''}"
                  />
                </div>
              </div>

              <div style="margin-bottom: 15px;">
                <span style="
                  padding: 4px 8px;
                  background: ${getGenderColor(d.data.data.gender)};
                  backdrop-filter: blur(4px);
                  border-radius: 9999px;
                  font-size: 12px;
                  font-weight: 500;
                  border: 1px solid ${getGenderAccent(d.data.data.gender)};
                  color: ${getGenderAccent(d.data.data.gender)};
                ">
                  Đời ${d.data.data.generation}
                </span>
              </div>

              <h3 style="font-size: 14px; font-weight: 600; color: cosmic-glow; margin-bottom: 8px;">
                ${d.data.data.name}
              </h3>

              <div style="font-size: 12px; color: muted-foreground; opacity: 0.7; font-weight: 500; margin-bottom: 8px;">
                ${
                  isDeceased && age !== null && !isNaN(age)
                    ? `${age} tuổi - Đã mất`
                    : age !== null && !isNaN(age)
                      ? `${age} tuổi`
                      : d.data.data.birthday || ''
                }
              </div>
            </div>
          </div>
        `;
      });

    // Configure the chart methods that return Chart instance
    chart
      .setCardYSpacing(250)
      .setCardXSpacing(220)
      .setOrientationVertical()
      .setProgenyDepth(10)
      .setAncestryDepth(10)
      .setTransitionTime(300);

    chart.updateTree({ tree_position: 'main_to_middle', transition_time: 300 });

    // Restrict interactions to container bounds
    setTimeout(() => {
      if (treeRef.current) {
        const container = treeRef.current;
        const svg = container.querySelector('svg');

        if (svg) {
          // Prevent events from bubbling outside container
          container.style.isolation = 'isolate';
          container.style.touchAction = 'pan-x pan-y';

          // Add event listeners to prevent interaction outside container
          const preventOutsideInteraction = (e) => {
            const rect = container.getBoundingClientRect();
            const isInside =
              e.clientX >= rect.left &&
              e.clientX <= rect.right &&
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom;

            if (!isInside) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          };

          // Apply to various interaction events
          [
            'mousedown',
            'mouseup',
            'mousemove',
            'wheel',
            'touchstart',
            'touchmove',
            'touchend',
          ].forEach((eventType) => {
            container.addEventListener(eventType, preventOutsideInteraction, { capture: true });
          });

          // Store event listeners for cleanup
          container._interactionListeners = [
            'mousedown',
            'mouseup',
            'mousemove',
            'wheel',
            'touchstart',
            'touchmove',
            'touchend',
          ];

          // Click handler: navigation is handled by inline avatar handlers; this handler will
          // only close active overlays when clicking outside any card to avoid accidental navigation.
          const onCardClick = (e) => {
            try {
              const target = e.target;
              const card = target.closest && target.closest('.cosmic-family-card');
              console.log('[onCardClick]', { tag: target.tagName, clientX: e.clientX, clientY: e.clientY, onCard: !!card });
              // If click is outside a card, dismiss the active overlay
              if (!card) {
                setActiveNode(null);
              }
            } catch (err) {
              // ignore
            }
          };

          container.addEventListener('click', onCardClick);
          container._memberClickHandler = onCardClick;
        }

        const fixClipping = () => {
          const allElements = treeRef.current.querySelectorAll('svg, div, foreignObject');
          allElements.forEach((el) => {
            el.style.overflow = 'visible';
            el.style.clipPath = 'none';
            el.style.clip = 'none';
            el.removeAttribute('clip-path');
            el.removeAttribute('clip');
          });
        };

        fixClipping();

        const observer = new MutationObserver(fixClipping);
        observer.observe(treeRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'clip', 'clip-path'],
        });

        treeRef.current._clippingObserver = observer;
      }
      onLoaded && onLoaded();
    }, 100);

    return () => {
      // Clean up global handler
      delete window.treeActionHandler;

      if (treeRef.current) {
        // Clean up interaction listeners
        if (treeRef.current._interactionListeners) {
          const container = treeRef.current;
          treeRef.current._interactionListeners.forEach((eventType) => {
            container.removeEventListener(eventType, () => {}, { capture: true });
          });
        }

        // Clean up member card click handler
        try {
          if (treeRef.current._memberClickHandler) {
            treeRef.current.removeEventListener('click', treeRef.current._memberClickHandler);
          }
        } catch (err) {
          // ignore
        }

        if (treeRef.current._clippingObserver) {
          treeRef.current._clippingObserver.disconnect();
        }
        treeRef.current.innerHTML = '';
      }
    };
  }, [data, onLoaded]);

  // If a focusMemberId is provided from parent, open the overlay for that member
  useEffect(() => {
    if (!focusMemberId || !data || !data.length) return;

    // allow the DOM to render and then toggle the overlay
    const t = setTimeout(() => {
      const member = data.find((m) => m.id === focusMemberId);
      if (member) {
        setActiveNode({ id: focusMemberId, gender: member.gender, member });
      }
    }, 220);

    return () => clearTimeout(t);
  }, [focusMemberId, data]);

  // Sync overlay position/scale with SVG element
  useLayoutEffect(() => {
    if (!activeNode) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const syncPosition = () => {
      const targetCard = document.getElementById(`card-${activeNode.id}`);
      const overlay = overlayRef.current;
      const container = containerRef.current;

      if (targetCard && overlay && container) {
        const cardRect = targetCard.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const relativeX = cardRect.left - containerRect.left;
        const relativeY = cardRect.top - containerRect.top;

        // Calculate scale based on base width (160px)
        const currentScale = cardRect.width / 160;
        overlay.style.setProperty('--scale-factor', currentScale);

        overlay.style.transform = `translate(${relativeX}px, ${relativeY}px)`;
        overlay.style.width = `${cardRect.width}px`;
        overlay.style.height = `${cardRect.height}px`;
        overlay.style.display = 'block';
      }
      animationFrameId.current = requestAnimationFrame(syncPosition);
    };
    syncPosition();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [activeNode]);

  // Overlay component for add actions
  const renderOverlay = () => {
    if (!activeNode) return null;
    const { id, gender } = activeNode;

    const btnCommon = {
      position: 'absolute',
      width: 'calc(40px * var(--scale-factor))',
      height: 'calc(40px * var(--scale-factor))',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'calc(28px * var(--scale-factor))',
      fontWeight: '300',
      cursor: 'pointer',
      pointerEvents: 'auto',
      border: 'calc(1px * var(--scale-factor)) solid rgba(255,255,255,0.2)',
      boxShadow:
        '0 calc(4px * var(--scale-factor)) calc(10px * var(--scale-factor)) rgba(0,0,0,0.3)',
      zIndex: 100,
    };

    // Dynamic positioning based on gender
    const sideStyle =
      gender === 'F'
        ? { left: 'calc(-60px * var(--scale-factor))', top: '50%', transform: 'translateY(-50%)' }
        : { right: 'calc(-60px * var(--scale-factor))', top: '50%', transform: 'translateY(-50%)' };

    const bottomStyle = {
      bottom: 'calc(-60px * var(--scale-factor))',
      left: '50%',
      transform: 'translateX(-50%)',
    };

    const topRightStyle = {
      top: 'calc(-60px * var(--scale-factor))',
      right: 'calc(-60px * var(--scale-factor))',
    };

    const topLeftStyle = {
      top: 'calc(-60px * var(--scale-factor))',
      left: 'calc(-60px * var(--scale-factor))',
    };

    // Don't show overlay if adding or blocking
    if (isAdding || isBlocking) return null;

    return (
      <div
        ref={overlayRef}
        role="dialog"
        aria-label="Member actions"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          border: 'calc(2px * var(--scale-factor)) solid rgba(255, 255, 255, 0.9)',
          borderRadius: 'calc(16px * var(--scale-factor))',
          zIndex: 50,
          display: 'none',
          '--scale-factor': '1',
        }}
      >
        {/* Update (top-left) */}
        <div
          aria-label="Chỉnh thành viên"
          style={{ ...btnCommon, ...topLeftStyle }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveNode(null);
            onEditMember?.(activeNode.member);
          }}
          title="Chỉnh sửa thành viên"
        >
          ✎
        </div>

        {/* Delete (top-right) */}
        <div
          aria-label="Xóa thành viên"
          style={{ ...btnCommon, ...topRightStyle }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveNode(null);
            // Nếu có prop onNodeAction thì gọi luôn (mock mode)
            if (typeof onNodeAction === 'function' && !onDeleteMember) {
              onNodeAction('delete', id);
              return;
            }
            if (activeNode.member?.linkedUserId) {
              alert("Không thể xoá thành viên đã liên kết tài khoản");
              return;
            }
            onDeleteMember?.(activeNode.id);
          }}
          title="Xóa thành viên"
        >
          🗑
        </div>

        {/* Add Spouse (side based on gender) */}
        <div
          aria-label="Thêm vợ/chồng"
          style={{ ...btnCommon, ...sideStyle }}
          onClick={(e) => {
            e.stopPropagation();
            if (onNodeAction) onNodeAction('add_spouse', id);
          }}
          title="Thêm Vợ/Chồng"
        >
          +
        </div>

        {/* Add Child (bottom) */}
        <div
          aria-label="Thêm con"
          style={{ ...btnCommon, ...bottomStyle }}
          onClick={(e) => {
            e.stopPropagation();
            if (onNodeAction) onNodeAction('add_child', id);
          }}
          title="Thêm Con"
        >
          +
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef} // Attach container ref
      className="relative w-full h-full"
      // Click background to dismiss overlay
      onClick={(e) => {
        console.log('[container click]', { tag: e.target.tagName, activeNode });
        if (e.target === containerRef.current || e.target.tagName === 'svg') setActiveNode(null);
      }}
      style={{
        overflow: 'hidden', // Changed from 'visible' to contain interactions
        isolation: 'isolate',
        touchAction: 'pan-x pan-y',
        cursor: 'grab',
      }}
    >
      <div ref={treeRef} style={{ width: '100%', height: '100%' }} />
      {renderOverlay()}
    </div>
  );
};

export default FamilyTreeChart;
