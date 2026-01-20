import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md transform space-y-8 rounded-2xl border border-border bg-card p-10 text-center shadow-xl transition-all duration-300">
        {/* Icon Container */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
          <FileQuestion className="h-12 w-12 text-primary" strokeWidth={1.5} />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Page not found
          </h1>
          <p className="text-base text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-2.5 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </button>
        </div>

        {/* Technical Details (Optional subtle footer) */}
        <div className="mt-8 border-t pt-6">
          <p className="text-xs text-muted-foreground">
            Path:{" "}
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded-md">
              {location.pathname}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
