import { useState, useEffect } from "react";
import { JobSeekerLayout } from "../../components/JobSeekerLayout";
import { EmployerLayout } from "../../components/EmployerLayout";
import { SimpleLayout } from "../../components/SimpleLayout";

import { ErrorBoundary } from "../../components/ErrorBoundary";
import { usePerformanceTimer } from "../../components/PerformanceMonitor";
import { withTimeout } from "../../lib/supabase";
import { useLocation } from "react-router-dom";
// import companyLogo from "../../public/images/company-logo.png"; 

export function ClientOnlyMainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;
  const [isJobSeekerRoute, setIsJobSeekerRoute] = useState(false);
  const [isEmployerRoute, setIsEmployerRoute] = useState(false);

  const [dbSetupNeeded, setDbSetupNeeded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { startTimer } = usePerformanceTimer("App-initialization");

  // Check route type based on pathname
  useEffect(() => {
    setIsJobSeekerRoute(pathname.startsWith("/jobseeker-dashboard"));
    setIsEmployerRoute(pathname.startsWith("/employer/dashboard"));
  }, [pathname]);

  // Check if database setup is needed
  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn("App initialization taking too long, proceeding without database check");
        setDbSetupNeeded(false);
        setLoading(false);
      }
    }, 5000); // 5 second fallback timeout

    checkDatabaseSetup().finally(() => {
      if (isMounted) {
        clearTimeout(timeoutId);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const checkDatabaseSetup = async () => {
    const timer = startTimer();
    try {
      // Check legacy browser storage setup (for old MongoDB sim)
      const dbKeys = [
        'postgresql_megajob_db_job_categories',
        'postgresql_megajob_db_companies',
        'postgresql_megajob_db_users'
      ];
      
      let hasValidData = false;
      for (const dbKey of dbKeys) {
        const data = localStorage.getItem(dbKey);
        if (data && data !== '[]' && data !== 'null') {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              hasValidData = true;
              break;
            }
          } catch (parseError) {
            console.warn(`Error parsing ${dbKey}:`, parseError);
          }
        }
      }
      
      if (hasValidData) {
        // Legacy data found, no setup needed
        console.log("Legacy data found, database ready");
        setDbSetupNeeded(false);
        setLoading(false);
        return;
      }

      // If no valid data found, setup is needed
      console.log("No legacy data found, setup required");
      setDbSetupNeeded(true);
    } catch (error: any) {
      console.log(
        "Database check failed, continuing without database:",
        error?.message || error,
      );
      // Don't require setup if Supabase is not configured or check fails
      setDbSetupNeeded(false);
    } finally {
      setLoading(false);
      if (timer && typeof timer.end === "function") {
        timer.end();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <img
            src={'/CompanyLogo.png'}
            alt="MegaJob Nepal"
            width={120}
            height={120}
            className="object-contain mx-auto mb-6 opacity-90"
          />
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading MegaJobNepal...</p>
          <div className="mt-2 text-xs text-muted-foreground/70">
            Please wait while we prepare your experience
          </div>
        </div>
      </div>
    );
  }





  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {isJobSeekerRoute ? (
          <ErrorBoundary>
            <JobSeekerLayout />
          </ErrorBoundary>
        ) : isEmployerRoute ? (
          <ErrorBoundary>
            <EmployerLayout />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <SimpleLayout>{children}</SimpleLayout>
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
}
