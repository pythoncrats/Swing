import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper-50 px-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-navy-900 text-amber-400">
        <Compass size={24} strokeWidth={1.75} />
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-500">
        The page you're looking for doesn't exist, or you may not have access to it.
      </p>
      <Button as={Link} to="/">
        Back to Swing
      </Button>
    </div>
  );
}
