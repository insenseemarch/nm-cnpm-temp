/// <reference types="node" />
// @ts-nocheck
import { PrismaClient, Gender, MaritalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with test family tree data...");

  // 1. Create test user (admin of family)
  const hashedPassword = await bcrypt.hash("Test123!", 10);

  const testUser = await prisma.user.upsert({
    where: { email: "test@family.com" },
    update: {},
    create: {
      email: "test@family.com",
      password: hashedPassword,
      name: "Nguyễn Văn Test",
      phone: "0901234567",
    },
  });
  console.log("✅ Created test user:", testUser.email);

  // 2. Create family with 4-digit code
  const familyId = "1234";
  const family = await prisma.family.upsert({
    where: { id: familyId },
    update: {},
    create: {
      id: familyId,
      name: "Họ Nguyễn",
      description: "Gia đình họ Nguyễn - Dữ liệu test",
      adminId: testUser.id,
    },
  });
  console.log("✅ Created family:", family.name, "- ID:", family.id);

  // 3. Add test user to family members
  await prisma.family.update({
    where: { id: familyId },
    data: {
      users: {
        connect: { id: testUser.id },
      },
    },
  });

  // 4. Create family members (3 generations)
  // Generation 1 - Grandparents
  const grandfather = await prisma.familyMember.upsert({
    where: { id: "grandfather-1" },
    update: {},
    create: {
      id: "grandfather-1",
      familyId: familyId,
      name: "Nguyễn Văn Minh",
      gender: Gender.MALE,
      birthDate: new Date("1940-01-15"),
      deathDate: new Date("2015-06-20"),
      occupation: "Nông dân",
      hometown: "Hà Nội",
      currentAddress: "Hà Nội",
      maritalStatus: MaritalStatus.MARRIED,
      marriageDate: new Date("1962-03-10"),
      generation: 1,
      bio: "Người sáng lập gia đình, đã cống hiến cả đời cho gia đình.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
  });

  const grandmother = await prisma.familyMember.upsert({
    where: { id: "grandmother-1" },
    update: {},
    create: {
      id: "grandmother-1",
      familyId: familyId,
      name: "Trần Thị Hoa",
      gender: Gender.FEMALE,
      birthDate: new Date("1945-05-20"),
      occupation: "Nội trợ",
      hometown: "Hải Phòng",
      currentAddress: "Hà Nội",
      maritalStatus: MaritalStatus.MARRIED,
      marriageDate: new Date("1962-03-10"),
      generation: 1,
      spouseId: grandfather.id,
      bio: "Người bà hiền từ, tận tụy với gia đình.",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    },
  });

  // Update grandfather's spouseId
  await prisma.familyMember.update({
    where: { id: grandfather.id },
    data: { spouseId: grandmother.id },
  });

  // Generation 2 - Parents
  const father = await prisma.familyMember.upsert({
    where: { id: "father-1" },
    update: {},
    create: {
      id: "father-1",
      familyId: familyId,
      name: "Nguyễn Văn Hùng",
      gender: Gender.MALE,
      birthDate: new Date("1965-08-10"),
      occupation: "Giáo viên",
      hometown: "Hà Nội",
      currentAddress: "Hà Nội",
      maritalStatus: MaritalStatus.MARRIED,
      marriageDate: new Date("1990-12-25"),
      generation: 2,
      fatherId: grandfather.id,
      motherId: grandmother.id,
      childOrder: 1,
      bio: "Con trai trưởng, giáo viên dạy toán.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
  });

  const mother = await prisma.familyMember.upsert({
    where: { id: "mother-1" },
    update: {},
    create: {
      id: "mother-1",
      familyId: familyId,
      name: "Lê Thị Lan",
      gender: Gender.FEMALE,
      birthDate: new Date("1968-03-15"),
      occupation: "Y tá",
      hometown: "Nam Định",
      currentAddress: "Hà Nội",
      maritalStatus: MaritalStatus.MARRIED,
      marriageDate: new Date("1990-12-25"),
      generation: 2,
      spouseId: father.id,
      bio: "Người mẹ tận tụy với gia đình.",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
  });

  // Update father's spouseId
  await prisma.familyMember.update({
    where: { id: father.id },
    data: { spouseId: mother.id },
  });

  const uncle = await prisma.familyMember.upsert({
    where: { id: "uncle-1" },
    update: {},
    create: {
      id: "uncle-1",
      familyId: familyId,
      name: "Nguyễn Văn Nam",
      gender: Gender.MALE,
      birthDate: new Date("1970-11-05"),
      occupation: "Kỹ sư",
      hometown: "Hà Nội",
      currentAddress: "Hồ Chí Minh",
      maritalStatus: MaritalStatus.MARRIED,
      marriageDate: new Date("1995-06-15"),
      generation: 2,
      fatherId: grandfather.id,
      motherId: grandmother.id,
      childOrder: 2,
      bio: "Con trai thứ hai, làm kỹ sư ở Sài Gòn.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    },
  });

  // Generation 3 - Children (linked to test user)
  const _son1 = await prisma.familyMember.upsert({
    where: { id: "son-1" },
    update: {},
    create: {
      id: "son-1",
      familyId: familyId,
      linkedUserId: testUser.id, // Link this member to test user
      name: "Nguyễn Văn Test",
      email: "test@family.com",
      gender: Gender.MALE,
      birthDate: new Date("1995-04-20"),
      occupation: "Kỹ sư phần mềm",
      hometown: "Hà Nội",
      currentAddress: "Hà Nội",
      maritalStatus: MaritalStatus.SINGLE,
      generation: 3,
      fatherId: father.id,
      motherId: mother.id,
      childOrder: 1,
      isVerified: true,
      bio: "Con trai đầu, đang làm về công nghệ.",
      avatar:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=100&h=100&fit=crop&crop=face",
    },
  });

  const _daughter = await prisma.familyMember.upsert({
    where: { id: "daughter-1" },
    update: {},
    create: {
      id: "daughter-1",
      familyId: familyId,
      name: "Nguyễn Thị Mai",
      gender: Gender.FEMALE,
      birthDate: new Date("1998-09-12"),
      occupation: "Sinh viên",
      hometown: "Hà Nội",
      currentAddress: "Hà Nội",
      maritalStatus: MaritalStatus.SINGLE,
      generation: 3,
      fatherId: father.id,
      motherId: mother.id,
      childOrder: 2,
      bio: "Con gái út, đang học đại học.",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    },
  });

  const _cousin = await prisma.familyMember.upsert({
    where: { id: "cousin-1" },
    update: {},
    create: {
      id: "cousin-1",
      familyId: familyId,
      name: "Nguyễn Anh Tuấn",
      gender: Gender.MALE,
      birthDate: new Date("1997-07-08"),
      occupation: "Bác sĩ",
      hometown: "Hồ Chí Minh",
      currentAddress: "Hồ Chí Minh",
      maritalStatus: MaritalStatus.SINGLE,
      generation: 3,
      fatherId: uncle.id,
      childOrder: 1,
      bio: "Con trai của chú Nam, là bác sĩ.",
      avatar:
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop&crop=face",
    },
  });

  console.log("✅ Created 8 family members across 3 generations");
  console.log("\n========================================");
  console.log("🎉 Seed completed successfully!");
  console.log("========================================");
  console.log("\n📧 Test Account:");
  console.log("   Email: test@family.com");
  console.log("   Password: Test123!");
  console.log("   Family ID: 1234");
  console.log("\n👥 Family Members:");
  console.log("   - Đời 1: Ông Nguyễn Văn Minh (đã mất), Bà Trần Thị Hoa");
  console.log(
    "   - Đời 2: Bố Nguyễn Văn Hùng, Mẹ Lê Thị Lan, Chú Nguyễn Văn Nam"
  );
  console.log(
    "   - Đời 3: Nguyễn Văn Test (linked user), Nguyễn Thị Mai, Nguyễn Anh Tuấn"
  );
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
