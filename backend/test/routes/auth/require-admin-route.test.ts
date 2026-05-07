import Fastify from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/errors/app-error.js";

const { requireAdminMock } = vi.hoisted(() => {
  return {
    requireAdminMock: vi.fn(),
  };
});

vi.mock("../../../src/routes/auth/require-admin.js", () => {
  return {
    requireAdmin: requireAdminMock,
  };
});

describe("admin protected route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  async function createTestApp() {
    const app = Fastify();

    app.get("/test/admin-only", async (request, reply) => {
      try {
        const user = await requireAdminMock(request);

        return reply.code(200).send({
          user,
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: {
              code: error.code,
              message: error.message,
            },
          });
        }

        throw error;
      }
    });

    return app;
  }

  it("returns 200 for an authenticated admin", async () => {
    const app = await createTestApp();

    requireAdminMock.mockResolvedValue({
      id: "user-1",
      email: "max@example.com",
      displayName: "Max",
      role: "ADMIN",
    });

    const response = await app.inject({
      method: "GET",
      url: "/test/admin-only",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      user: {
        id: "user-1",
        email: "max@example.com",
        displayName: "Max",
        role: "ADMIN",
      },
    });

    await app.close();
  });

  it("returns 401 when authentication is missing", async () => {
    const app = await createTestApp();

    requireAdminMock.mockRejectedValue(
      new AppError("UNAUTHORIZED", 401, "authentication required"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/test/admin-only",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "authentication required",
      },
    });

    await app.close();
  });

  it("returns 403 when the authenticated user is not an admin", async () => {
    const app = await createTestApp();

    requireAdminMock.mockRejectedValue(
      new AppError("FORBIDDEN", 403, "admin access required"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/test/admin-only",
      headers: {
        cookie: "session=session-token",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "admin access required",
      },
    });

    await app.close();
  });
});
