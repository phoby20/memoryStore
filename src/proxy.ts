import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/api/memories(.*)",
  "/api/search(.*)",
  "/api/apikeys(.*)",
  "/api/setup(.*)",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  if (isApiRoute) return;

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
