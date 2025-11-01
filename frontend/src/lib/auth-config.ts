// Authentication configuration for MegaJobNepal
// Using backend API with MySQL; values remain placeholders for UI

export const projectId = "megajobnepal-mysql";
export const publicAnonKey = "mysql-backend-auth";

export const isSupabaseConfigured = () => {
  // Always return false since we are not using Supabase
  return false;
};

export const isMongoDBConfigured = () => {
  // Legacy: Check localStorage keys used in earlier browser storage sim
  try {
    const dbKeys = [
      'mysql_megajob_db_job_categories',
      'mysql_megajob_db_companies',
      'mysql_megajob_db_users'
    ];
    
    for (const key of dbKeys) {
      const data = localStorage.getItem(key);
      if (data && data !== '[]' && data !== 'null') {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};
