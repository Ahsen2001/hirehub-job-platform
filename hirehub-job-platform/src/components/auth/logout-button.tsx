import { logoutUser } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutUser}>
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-dark transition-colors hover:border-primary hover:text-primary"
      >
        Logout
      </button>
    </form>
  );
}
