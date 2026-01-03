import prisma from "../utils/prisma";
import notificationService from "./notification.service";

/**
 * Scheduler Service
 * Handles scheduled notifications for birthdays, anniversaries, and events
 */
export class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the scheduler
   * Runs daily to check for upcoming events
   */
  start() {
    console.log("🕐 Scheduler service started");

    // Run immediately on start
    this.runDailyTasks();

    // Then run every 24 hours (86400000 ms)
    this.intervalId = setInterval(() => {
      this.runDailyTasks();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("🛑 Scheduler service stopped");
    }
  }

  /**
   * Run all daily scheduled tasks
   */
  async runDailyTasks() {
    console.log("📅 Running daily scheduled tasks...");

    try {
      await Promise.all([
        this.checkUpcomingBirthdays(),
        this.checkUpcomingAnniversaries(),
        this.checkUpcomingEvents(),
      ]);
      console.log("✅ Daily scheduled tasks completed");
    } catch (error) {
      console.error("❌ Error running scheduled tasks:", error);
    }
  }

  /**
   * Check for upcoming birthdays (within next 7 days)
   * Send BIRTHDAY_REMINDER to all family members
   */
  async checkUpcomingBirthdays() {
    console.log("🎂 Checking upcoming birthdays...");

    try {
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      // Get all families with their members
      const families = await prisma.family.findMany({
        select: {
          id: true,
          name: true,
          adminId: true,
          users: { select: { id: true } },
          members: {
            where: {
              isDeleted: false,
              birthDate: { not: null },
            },
            select: {
              id: true,
              name: true,
              birthDate: true,
            },
          },
        },
      });

      for (const family of families) {
        for (const member of family.members) {
          if (!member.birthDate) continue;

          // Check if birthday is within next 7 days (ignore year)
          const birthDate = new Date(member.birthDate);
          const birthdayThisYear = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
          );

          // If birthday already passed this year, check next year
          if (birthdayThisYear < todayStart) {
            birthdayThisYear.setFullYear(birthdayThisYear.getFullYear() + 1);
          }

          const daysUntilBirthday = Math.ceil(
            (birthdayThisYear.getTime() - todayStart.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          // Send notification if birthday is within 7 days
          if (daysUntilBirthday >= 0 && daysUntilBirthday <= 7) {
            // Check if notification already sent today for this member
            const existingNotification = await prisma.notification.findFirst({
              where: {
                type: "BIRTHDAY_REMINDER",
                familyId: family.id,
                data: {
                  path: ["memberId"],
                  equals: member.id,
                },
                createdAt: {
                  gte: todayStart,
                },
              },
            });

            if (existingNotification) continue;

            // Get all user IDs in family
            const userIds = family.users.map((u) => u.id);
            if (!userIds.includes(family.adminId)) {
              userIds.push(family.adminId);
            }

            // Create notifications for all family members
            const daysText =
              daysUntilBirthday === 0
                ? "hôm nay"
                : daysUntilBirthday === 1
                ? "ngày mai"
                : `trong ${daysUntilBirthday} ngày`;

            for (const userId of userIds) {
              try {
                await notificationService.createNotification({
                  userId,
                  familyId: family.id,
                  type: "BIRTHDAY_REMINDER",
                  title: "Sinh nhật sắp tới",
                  message: `Sinh nhật của ${member.name} sẽ diễn ra ${daysText}`,
                  data: {
                    memberId: member.id,
                    personName: member.name,
                    birthDate: member.birthDate.toISOString(),
                    daysUntil: daysUntilBirthday,
                    familyName: family.name,
                  },
                });
              } catch (err) {
                console.error(
                  `Failed to create birthday notification for user ${userId}:`,
                  err
                );
              }
            }

            console.log(
              `📧 Birthday reminder sent for ${member.name} (${daysText})`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error checking birthdays:", error);
    }
  }

  /**
   * Check for upcoming marriage anniversaries (within next 7 days)
   * Send ANNIVERSARY_REMINDER to all family members
   */
  async checkUpcomingAnniversaries() {
    console.log("💍 Checking upcoming anniversaries...");

    try {
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      // Get all families with their members who have marriage dates
      const families = await prisma.family.findMany({
        select: {
          id: true,
          name: true,
          adminId: true,
          users: { select: { id: true } },
          members: {
            where: {
              isDeleted: false,
              marriageDate: { not: null },
              maritalStatus: "MARRIED",
            },
            select: {
              id: true,
              name: true,
              marriageDate: true,
              spouse: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Track processed couples to avoid duplicate notifications
      const processedCouples = new Set<string>();

      for (const family of families) {
        for (const member of family.members) {
          if (!member.marriageDate || !member.spouse) continue;

          // Create unique key for couple (sorted IDs)
          const coupleKey = [member.id, member.spouse.id].sort().join("-");
          if (processedCouples.has(coupleKey)) continue;
          processedCouples.add(coupleKey);

          // Check if anniversary is within next 7 days (ignore year)
          const anniversaryDate = new Date(member.marriageDate);
          const anniversaryThisYear = new Date(
            today.getFullYear(),
            anniversaryDate.getMonth(),
            anniversaryDate.getDate()
          );

          // If anniversary already passed this year, check next year
          if (anniversaryThisYear < todayStart) {
            anniversaryThisYear.setFullYear(
              anniversaryThisYear.getFullYear() + 1
            );
          }

          const daysUntilAnniversary = Math.ceil(
            (anniversaryThisYear.getTime() - todayStart.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          // Send notification if anniversary is within 7 days
          if (daysUntilAnniversary >= 0 && daysUntilAnniversary <= 7) {
            // Check if notification already sent today for this couple
            const existingNotification = await prisma.notification.findFirst({
              where: {
                type: "ANNIVERSARY_REMINDER",
                familyId: family.id,
                data: {
                  path: ["coupleKey"],
                  equals: coupleKey,
                },
                createdAt: {
                  gte: todayStart,
                },
              },
            });

            if (existingNotification) continue;

            // Get all user IDs in family
            const userIds = family.users.map((u) => u.id);
            if (!userIds.includes(family.adminId)) {
              userIds.push(family.adminId);
            }

            const yearsMarried =
              today.getFullYear() - anniversaryDate.getFullYear();
            const daysText =
              daysUntilAnniversary === 0
                ? "hôm nay"
                : daysUntilAnniversary === 1
                ? "ngày mai"
                : `trong ${daysUntilAnniversary} ngày`;

            for (const userId of userIds) {
              try {
                await notificationService.createNotification({
                  userId,
                  familyId: family.id,
                  type: "ANNIVERSARY_REMINDER",
                  title: "Kỷ niệm ngày cưới sắp tới",
                  message: `Kỷ niệm ${yearsMarried} năm ngày cưới của ${member.name} và ${member.spouse.name} sẽ diễn ra ${daysText}`,
                  data: {
                    coupleKey,
                    member1Id: member.id,
                    member2Id: member.spouse.id,
                    personName: `${member.name} & ${member.spouse.name}`,
                    marriageDate: member.marriageDate.toISOString(),
                    yearsMarried,
                    daysUntil: daysUntilAnniversary,
                    familyName: family.name,
                  },
                });
              } catch (err) {
                console.error(
                  `Failed to create anniversary notification for user ${userId}:`,
                  err
                );
              }
            }

            console.log(
              `📧 Anniversary reminder sent for ${member.name} & ${member.spouse.name} (${daysText})`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error checking anniversaries:", error);
    }
  }

  /**
   * Check for upcoming events (within next 3 days)
   * Send EVENT_REMINDER to all family members
   */
  async checkUpcomingEvents() {
    console.log("📅 Checking upcoming events...");

    try {
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const threeDaysLater = new Date(todayStart);
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);

      // Get all upcoming events
      const events = await prisma.event.findMany({
        where: {
          eventDate: {
            gte: todayStart,
            lte: threeDaysLater,
          },
        },
        include: {
          family: {
            select: {
              id: true,
              name: true,
              adminId: true,
              users: { select: { id: true } },
            },
          },
        },
      });

      for (const event of events) {
        const eventDate = new Date(event.eventDate);
        const daysUntilEvent = Math.ceil(
          (eventDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if notification already sent today for this event
        const existingNotification = await prisma.notification.findFirst({
          where: {
            type: "EVENT_REMINDER",
            familyId: event.familyId,
            data: {
              path: ["eventId"],
              equals: event.id,
            },
            createdAt: {
              gte: todayStart,
            },
          },
        });

        if (existingNotification) continue;

        // Get all user IDs in family
        const userIds = event.family.users.map((u) => u.id);
        if (!userIds.includes(event.family.adminId)) {
          userIds.push(event.family.adminId);
        }

        const daysText =
          daysUntilEvent === 0
            ? "hôm nay"
            : daysUntilEvent === 1
            ? "ngày mai"
            : `trong ${daysUntilEvent} ngày`;

        for (const userId of userIds) {
          try {
            await notificationService.createNotification({
              userId,
              familyId: event.familyId,
              type: "EVENT_REMINDER",
              title: "Nhắc nhở sự kiện",
              message: `Sự kiện "${event.title}" sẽ diễn ra ${daysText}`,
              data: {
                eventId: event.id,
                eventTitle: event.title,
                eventType: event.eventType,
                eventDate: event.eventDate.toISOString(),
                daysUntil: daysUntilEvent,
                familyName: event.family.name,
              },
            });
          } catch (err) {
            console.error(
              `Failed to create event notification for user ${userId}:`,
              err
            );
          }
        }

        console.log(
          `📧 Event reminder sent for "${event.title}" (${daysText})`
        );
      }
    } catch (error) {
      console.error("Error checking events:", error);
    }
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  async cleanOldNotifications() {
    console.log("🧹 Cleaning old notifications...");

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
          isRead: true, // Only delete read notifications
        },
      });

      console.log(`🗑️ Deleted ${result.count} old notifications`);
    } catch (error) {
      console.error("Error cleaning old notifications:", error);
    }
  }
}

export default new SchedulerService();
