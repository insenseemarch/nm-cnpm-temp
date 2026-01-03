# 🚀 How to Implement New Features - Backend Workflow

This guide explains the **step-by-step workflow** for implementing new features in the Family Tree backend API. Follow this pattern for consistency across the codebase.

---

## 📐 Architecture Overview

We use a **3-layer architecture**:

```
Routes (HTTP Layer) → Controllers (Request Handling) → Services (Business Logic) → Prisma (Database)
```

**Key Principles:**
- **Services**: Pure business logic, database operations, reusable functions
- **Controllers**: HTTP request/response handling, input validation, error formatting
- **Routes**: Endpoint definitions, middleware application, Swagger documentation

---

## 🛠️ Step-by-Step Workflow

### Step 1: Define Your Feature Scope

Before coding, answer these questions:
- What endpoints do you need? (GET, POST, PUT, DELETE)
- What data models are involved? (Check `prisma/schema.prisma`)
- What permissions are required? (Public, Authenticated, Admin-only)
- What validation rules apply?

**Example:** Implementing "Family Events" feature
- Endpoints: Create event, List events, Update event, Delete event
- Models: `Event`, `User`, `Family`
- Permissions: Authenticated users only, must be family member
- Validation: Title required, valid date format

---

### Step 2: Create the Service Layer

**File:** `src/services/[feature].service.ts`

This is where your business logic lives. Services should:
- Interact with Prisma for database operations
- Contain reusable business logic
- Throw errors for invalid operations
- Return clean data objects

**Template:**

```typescript
import prisma from '../utils/prisma';

export class FeatureService {
  async create(userId: string, data: CreateDTO) {
    // 1. Validate business rules
    // 2. Check permissions
    // 3. Create record
    // 4. Return result
  }

  async findAll(userId: string, filters?: FilterDTO) {
    // 1. Build query with filters
    // 2. Check user permissions
    // 3. Fetch records
    // 4. Return results
  }

  async findById(id: string, userId: string) {
    // 1. Fetch record
    // 2. Check if exists
    // 3. Verify user has access
    // 4. Return record
  }

  async update(id: string, userId: string, data: UpdateDTO) {
    // 1. Find record
    // 2. Verify ownership/permissions
    // 3. Update record
    // 4. Return updated record
  }

  async delete(id: string, userId: string) {
    // 1. Find record
    // 2. Verify ownership/permissions
    // 3. Delete (or soft delete)
    // 4. Return success
  }
}
```

**Real Example from our codebase:**

```typescript
// src/services/event.service.ts
export class EventService {
  async createEvent(userId: string, familyId: string, data: CreateEventDTO) {
    // Check if user is member of family
    const membership = await prisma.family.findFirst({
      where: {
        id: familyId,
        users: { some: { id: userId } }
      }
    });

    if (!membership) {
      throw new Error('You are not a member of this family');
    }

    // Create event
    return await prisma.event.create({
      data: {
        ...data,
        familyId,
        createdBy: userId
      }
    });
  }
}
```

---

### Step 3: Create the Controller Layer

**File:** `src/controllers/[feature].controller.ts`

Controllers handle HTTP-specific logic:
- Parse request data (body, params, query)
- Call service methods
- Format responses
- Handle errors with proper status codes

**Template:**

```typescript
import { Request, Response } from 'express';
import { FeatureService } from '../services/[feature].service';

const service = new FeatureService();

export class FeatureController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user!.id; // From auth middleware
      const data = req.body;

      const result = await service.create(userId, data);

      res.status(201).json({
        message: 'Created successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Create error:', error);
      res.status(400).json({
        error: error.message || 'Creation failed'
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const filters = req.query;

      const results = await service.findAll(userId, filters);

      res.status(200).json({
        data: results
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // ... other methods
}
```

---

### Step 4: Create the Routes Layer

**File:** `src/routes/[feature].routes.ts`

Routes define your API endpoints and apply middleware.

**Template:**

```typescript
import { Router } from 'express';
import { FeatureController } from '../controllers/[feature].controller';
import { authenticateToken } from '../middleware/auth';
import { validate, featureSchema } from '../middleware/validation';

const router = Router();
const controller = new FeatureController();

/**
 * @swagger
 * /api/features:
 *   post:
 *     summary: Create a new feature
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feature created successfully
 */
router.post(
  '/',
  authenticateToken,
  validate(featureSchema),
  (req, res) => controller.create(req, res)
);

router.get('/', authenticateToken, (req, res) => controller.findAll(req, res));
router.get('/:id', authenticateToken, (req, res) => controller.findById(req, res));
router.put('/:id', authenticateToken, (req, res) => controller.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => controller.delete(req, res));

export default router;
```

---

### Step 5: Register Routes in App

**File:** `src/app.ts`

Add your routes to the main Express app:

```typescript
// Import your routes
import featureRoutes from './routes/[feature].routes';

// Register routes (add with other routes around line 80-90)
app.use('/api/features', featureRoutes);
```

---

### Step 6: Add Validation Schema (Optional)

**File:** `src/middleware/validation.ts`

Add validation for your feature if needed:

```typescript
export const featureSchema = {
  validate: (data: any) => {
    const errors: any[] = [];

    if (!data.name || data.name.trim().length < 1) {
      errors.push({
        path: ['name'],
        message: 'Name is required'
      });
    }

    return {
      error: errors.length > 0 ? { details: errors } : null
    };
  }
};
```

---

## 🧪 Testing Your Feature

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test with Swagger UI

1. Open your browser and navigate to: **http://localhost:3001/api-docs**
2. You'll see all your API endpoints with interactive documentation
3. Click on your endpoint (e.g., `POST /api/features`)
4. Click **"Try it out"**
5. Fill in the request body
6. For protected routes, click **"Authorize"** and paste your JWT token
7. Click **"Execute"** to test

### 3. Get a JWT Token

First, register or login to get a token:

1. Go to Swagger: **POST /api/auth/login**
2. Try it out with:
   ```json
   {
     "email": "your@email.com",
     "password": "yourpassword"
   }
   ```
3. Copy the `token` from the response
4. Click **"Authorize"** button at the top
5. Enter: `Bearer YOUR_TOKEN_HERE`
6. Now you can test protected endpoints!

---

## 🔧 Available Middleware

Use these existing middleware in your routes:

### Authentication
```typescript
import { authenticateToken, optionalAuth } from '../middleware/auth';

// Require authentication
router.post('/', authenticateToken, controller.create);

// Optional authentication (user context if available)
router.get('/public', optionalAuth, controller.publicList);
```

### Validation
```typescript
import { validate, validateId, validatePagination } from '../middleware/validation';

// Validate request body
router.post('/', validate(mySchema), controller.create);

// Validate URL params
router.get('/:id', validateId, controller.findById);

// Validate pagination query params
router.get('/', validatePagination, controller.findAll);
```

### File Upload
```typescript
import { uploadSingle, uploadMultiple, handleAvatarUpload } from '../middleware/upload';

// Single file upload
router.post('/avatar', uploadSingle('avatar'), handleAvatarUpload, controller.updateAvatar);

// Multiple files upload
router.post('/images', uploadMultiple('images', 5), controller.uploadImages);
```

---

## 📊 Database Operations with Prisma

### Common Patterns

**Create:**
```typescript
const record = await prisma.model.create({
  data: { ... }
});
```

**Find with relations:**
```typescript
const record = await prisma.model.findUnique({
  where: { id },
  include: {
    relatedModel: true,
    anotherRelation: {
      select: { id: true, name: true }
    }
  }
});
```

**Update:**
```typescript
const updated = await prisma.model.update({
  where: { id },
  data: { ... }
});
```

**Delete (soft delete recommended):**
```typescript
const deleted = await prisma.model.update({
  where: { id },
  data: { isDeleted: true, deletedAt: new Date() }
});
```

**Transactions (for multiple operations):**
```typescript
await prisma.$transaction(async (tx) => {
  await tx.model1.create({ ... });
  await tx.model2.update({ ... });
});
```

---

## 🎯 Best Practices

1. **Always validate input** - Use validation middleware
2. **Check permissions** - Verify user has access to resources
3. **Use transactions** - For operations affecting multiple tables
4. **Handle errors gracefully** - Return meaningful error messages
5. **Document with Swagger** - Add JSDoc comments for API docs
6. **Test thoroughly** - Use Swagger UI to test all scenarios
7. **Follow naming conventions** - Consistent file and function names
8. **Keep services pure** - No HTTP logic in services
9. **Use TypeScript types** - Leverage Prisma-generated types
10. **Log important events** - Help with debugging

---

## 🐛 Debugging Tools

### Prisma Studio
View and edit database records visually:
```bash
npx prisma studio
```
Opens at: http://localhost:5555

### Server Logs
Check terminal for detailed logs (queries, errors, etc.)

### Swagger UI
Interactive API documentation and testing:
http://localhost:3001/api-docs

---

## 📚 Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Express.js**: https://expressjs.com/
- **Swagger**: https://swagger.io/docs/
- **TypeScript**: https://www.typescriptlang.org/

---

## ✅ Checklist for New Features

- [ ] Service layer created with business logic
- [ ] Controller layer created with HTTP handling
- [ ] Routes defined with proper middleware
- [ ] Routes registered in `app.ts`
- [ ] Validation schema added (if needed)
- [ ] Swagger documentation added
- [ ] Tested with Swagger UI
- [ ] Error handling implemented
- [ ] Permissions checked
- [ ] Code reviewed

---

Happy coding! 🚀 If you have questions, check existing implementations in `src/services`, `src/controllers`, and `src/routes`.
