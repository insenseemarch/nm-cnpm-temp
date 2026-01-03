/// <reference types="node" />
// @ts-nocheck
import { PrismaClient, NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

async function seedNotifications() {
  console.log("🔔 Seeding test notifications for all types...\n");

  // Get existing test user and family
  const testUser = await prisma.user.findUnique({
    where: { email: "test@family.com" },
  });

  if (!testUser) {
    console.error("❌ Test user not found! Please run 'npm run db:seed' first.");
    process.exit(1);
  }

  const family = await prisma.family.findFirst({
    where: { adminId: testUser.id },
  });

  if (!family) {
    console.error("❌ Family not found! Please run 'npm run db:seed' first.");
    process.exit(1);
  }

  console.log(`✅ Found test user: ${testUser.email}`);
  console.log(`✅ Found family: ${family.name} (ID: ${family.id})\n`);

  // Create a second test user to be the "sender" of notifications
  const senderUser = await prisma.user.upsert({
    where: { email: "sender@family.com" },
    update: {},
    create: {
      email: "sender@family.com",
      password: "$2a$10$xxxnotneeded", // Won't be used for login
      name: "Trần Văn Sender",
      phone: "0912345678",
    },
  });
  console.log(`✅ Created/found sender user: ${senderUser.name}\n`);

  // Delete existing test notifications
  await prisma.notification.deleteMany({
    where: {
      userId: testUser.id,
    },
  });
  console.log("🗑️ Cleared existing notifications\n");

  // Create all notification types
  const now = new Date();
  const notifications = [
    // 1. JOIN_REQUEST - Yêu cầu tham gia gia đình
    {
      userId: testUser.id,
      senderId: senderUser.id,
      familyId: family.id,
      type: "JOIN_REQUEST" as NotificationType,
      title: "Yêu cầu tham gia gia đình",
      message: `${senderUser.name} đã gửi yêu cầu tham gia gia đình ${family.name}`,
      data: {
        requestId: "test-join-request-1",
        personName: senderUser.name,
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    },

    // 2. JOIN_APPROVED - Yêu cầu tham gia được chấp nhận
    {
      userId: testUser.id,
      senderId: senderUser.id,
      familyId: family.id,
      type: "JOIN_APPROVED" as NotificationType,
      title: "Yêu cầu tham gia được chấp nhận",
      message: `Yêu cầu tham gia gia đình ${family.name} của bạn đã được chấp nhận`,
      data: {
        requestId: "test-join-request-2",
        familyName: family.name,
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },

    // 3. JOIN_REJECTED - Yêu cầu tham gia bị từ chối
    {
      userId: testUser.id,
      senderId: senderUser.id,
      familyId: family.id,
      type: "JOIN_REJECTED" as NotificationType,
      title: "Yêu cầu tham gia bị từ chối",
      message: `Yêu cầu tham gia gia đình ${family.name} của bạn đã bị từ chối`,
      data: {
        requestId: "test-join-request-3",
        familyName: family.name,
      },
      isRead: true, // Already read
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
    },

    // 4. MEMBER_REQUEST - Yêu cầu thêm thành viên
    {
      userId: testUser.id,
      senderId: senderUser.id,
      familyId: family.id,
      type: "MEMBER_REQUEST" as NotificationType,
      title: "Yêu cầu thêm thành viên mới",
      message: `${senderUser.name} đã gửi yêu cầu thêm thành viên Nguyễn Văn Mới`,
      data: {
        requestId: "test-member-request-1",
        requestType: "ADD_MEMBER",
        personName: "Nguyễn Văn Mới",
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    },

    // 5. MEMBER_REQUEST - Yêu cầu xóa thành viên
    {
      userId: testUser.id,
      senderId: senderUser.id,
      familyId: family.id,
      type: "MEMBER_REQUEST" as NotificationType,
      title: "Yêu cầu xóa thành viên",
      message: `${senderUser.name} đã gửi yêu cầu xóa thành viên Nguyễn Thị Cũ`,
      data: {
        requestId: "test-member-request-2",
        requestType: "DELETE_MEMBER",
        personName: "Nguyễn Thị Cũ",
        targetMemberId: "member-123",
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
    },

    // 6. MEMBER_REQUEST - Yêu cầu chỉnh sửa thành viên
    {
      userId: testUser.id,
      senderId: senderUser.id,
      familyId: family.id,
      type: "MEMBER_REQUEST" as NotificationType,
      title: "Yêu cầu chỉnh sửa thông tin",
      message: `${senderUser.name} đã gửi yêu cầu chỉnh sửa thông tin Nguyễn Văn Sửa`,
      data: {
        requestId: "test-member-request-3",
        requestType: "EDIT_MEMBER",
        personName: "Nguyễn Văn Sửa",
        targetMemberId: "member-456",
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 50 * 60 * 1000), // 50 minutes ago
    },

    // 7. MEMBER_APPROVED - Yêu cầu thêm thành viên được chấp nhận
    {
      userId: testUser.id,
      senderId: senderUser.id,
      familyId: family.id,
      type: "MEMBER_APPROVED" as NotificationType,
      title: "Yêu cầu thành viên được chấp nhận",
      message: `Yêu cầu thêm thành viên "Nguyễn Văn Mới" đã được chấp nhận`,
      data: {
        requestId: "test-member-request-4",
        requestType: "ADD_MEMBER",
        personName: "Nguyễn Văn Mới",
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
    },

    // 8. MEMBER_REJECTED - Yêu cầu thành viên bị từ chối
    {
      userId: testUser.id,
      senderId: senderUser.id,
      familyId: family.id,
      type: "MEMBER_REJECTED" as NotificationType,
      title: "Yêu cầu thành viên bị từ chối",
      message: `Yêu cầu chỉnh sửa thành viên "Nguyễn Văn Edit" đã bị từ chối`,
      data: {
        requestId: "test-member-request-5",
        requestType: "EDIT_MEMBER",
        personName: "Nguyễn Văn Edit",
      },
      isRead: true,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    },

    // 9. EVENT_REMINDER - Nhắc nhở sự kiện
    {
      userId: testUser.id,
      senderId: null,
      familyId: family.id,
      type: "EVENT_REMINDER" as NotificationType,
      title: "Họp mặt gia đình cuối năm",
      message: "Sự kiện sẽ diễn ra vào ngày 30/12/2025",
      data: {
        eventId: "test-event-1",
        eventTitle: "Họp mặt gia đình cuối năm",
        eventDate: "2025-12-30T10:00:00Z",
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
    },

    // 10. NEW_ACHIEVEMENT - Thành tích mới
    {
      userId: testUser.id,
      senderId: senderUser.id,
      familyId: family.id,
      type: "NEW_ACHIEVEMENT" as NotificationType,
      title: "Thành tích mới trong gia đình",
      message: `Nguyễn Văn Test đạt giải Nhất cuộc thi lập trình`,
      data: {
        achievementId: "test-achievement-1",
        achievementTitle: "Giải Nhất cuộc thi lập trình",
        personName: "Nguyễn Văn Test",
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
    },

    // 11. ADMIN_TRANSFER - Chuyển quyền admin
    {
      userId: testUser.id,
      senderId: senderUser.id,
      familyId: family.id,
      type: "ADMIN_TRANSFER" as NotificationType,
      title: "Chuyển quyền quản trị",
      message: `${senderUser.name} đã chuyển quyền quản trị gia đình cho bạn`,
      data: {
        oldAdminName: senderUser.name,
        newAdminName: testUser.name,
      },
      isRead: true,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },

    // 12. BIRTHDAY_REMINDER - Sinh nhật thành viên
    {
      userId: testUser.id,
      senderId: null,
      familyId: family.id,
      type: "BIRTHDAY_REMINDER" as NotificationType,
      title: "Sinh nhật sắp tới",
      message: "Sinh nhật của Nguyễn Thị Mai sẽ diễn ra vào ngày 12/09",
      data: {
        memberId: "daughter-1",
        personName: "Nguyễn Thị Mai",
        birthDate: "1998-09-12",
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
    },

    // 13. BIRTHDAY_REMINDER - Another birthday
    {
      userId: testUser.id,
      senderId: null,
      familyId: family.id,
      type: "BIRTHDAY_REMINDER" as NotificationType,
      title: "Sinh nhật sắp tới",
      message: "Sinh nhật của Nguyễn Văn Hùng sẽ diễn ra vào ngày 10/08",
      data: {
        memberId: "father-1",
        personName: "Nguyễn Văn Hùng",
        birthDate: "1965-08-10",
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
    },

    // 14. BIRTHDAY_REMINDER - Birthday 3
    {
      userId: testUser.id,
      senderId: null,
      familyId: family.id,
      type: "BIRTHDAY_REMINDER" as NotificationType,
      title: "Sinh nhật sắp tới",
      message: "Sinh nhật của Trần Thị Hoa sẽ diễn ra vào ngày 20/05",
      data: {
        memberId: "grandmother-1",
        personName: "Trần Thị Hoa",
        birthDate: "1945-05-20",
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
    },

    // 15. ANNIVERSARY_REMINDER - Kỷ niệm ngày cưới
    {
      userId: testUser.id,
      senderId: null,
      familyId: family.id,
      type: "ANNIVERSARY_REMINDER" as NotificationType,
      title: "Kỷ niệm ngày cưới sắp tới",
      message: "Kỷ niệm ngày cưới của Ông Minh và Bà Hoa vào ngày 10/03",
      data: {
        personName: "Ông Minh và Bà Hoa",
        anniversaryDate: "1962-03-10",
        years: 63,
      },
      isRead: false,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
    },
  ];

  // Insert all notifications
  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log(`✅ Created ${notifications.length} test notifications\n`);

  // Summary
  console.log("========================================");
  console.log("🎉 Notification seed completed!");
  console.log("========================================\n");
  console.log("📊 Notification Types Created:");
  console.log("   ✓ JOIN_REQUEST (1)");
  console.log("   ✓ JOIN_APPROVED (1)");
  console.log("   ✓ JOIN_REJECTED (1)");
  console.log("   ✓ MEMBER_REQUEST (3 - add, edit, delete)");
  console.log("   ✓ MEMBER_APPROVED (1)");
  console.log("   ✓ MEMBER_REJECTED (1)");
  console.log("   ✓ EVENT_REMINDER (1)");
  console.log("   ✓ NEW_ACHIEVEMENT (1)");
  console.log("   ✓ ADMIN_TRANSFER (1)");
  console.log("   ✓ BIRTHDAY_REMINDER (3)");
  console.log("   ✓ ANNIVERSARY_REMINDER (1)");
  console.log("\n📧 Login to test:");
  console.log("   Email: test@family.com");
  console.log("   Password: Test123!");
  console.log("\n");
}

seedNotifications()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
