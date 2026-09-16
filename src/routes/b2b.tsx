import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/b2b")({
  beforeLoad: () => {
    throw redirect({ to: "/enterprise" });
  },
});
