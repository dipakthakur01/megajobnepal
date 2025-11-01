// Search History Service for AI-powered job recommendations
import { safeStorage } from '../lib/safe-storage';

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: {
    category?: string;
    location?: string;
    jobType?: string;
    salaryRange?: string;
    experience?: string;
  };
  timestamp: Date;
  resultCount: number;
  clickedJobs: string[]; // Job IDs that were clicked
}

export interface UserInteraction {
  id: string;
  type: 'job_view' | 'job_save' | 'job_apply' | 'search' | 'filter_change';
  jobId?: string;
  searchQuery?: string;
  filters?: any;
  timestamp: Date;
  duration?: number; // Time spent on job details (in seconds)
}

export interface JobPreference {
  categories: { [key: string]: number }; // Category name -> preference score
  locations: { [key: string]: number }; // Location -> preference score
  companies: { [key: string]: number }; // Company -> preference score
  salaryRanges: { [key: string]: number }; // Salary range -> preference score
  keywords: { [key: string]: number }; // Keywords -> frequency
}

class SearchHistoryService {
  private readonly SEARCH_HISTORY_KEY = 'megajobnepal_search_history';
  private readonly USER_INTERACTIONS_KEY = 'megajobnepal_user_interactions';
  private readonly JOB_PREFERENCES_KEY = 'megajobnepal_job_preferences';
  private readonly MAX_HISTORY_ITEMS = 100;
  private readonly MAX_INTERACTIONS = 500;

  // Search History Management
  getSearchHistory(): SearchHistoryItem[] {
    try {
      const history = safeStorage.getItem(this.SEARCH_HISTORY_KEY);
      return history ? JSON.parse(history).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  addSearchHistory(item: Omit<SearchHistoryItem, 'id' | 'timestamp'>): void {
    try {
      const history = this.getSearchHistory();
      const newItem: SearchHistoryItem = {
        ...item,
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      history.unshift(newItem);
      
      // Keep only the most recent items
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history.splice(this.MAX_HISTORY_ITEMS);
      }

      safeStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
      this.updateJobPreferences(newItem);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  // User Interactions Management
  getUserInteractions(): UserInteraction[] {
    try {
      const interactions = safeStorage.getItem(this.USER_INTERACTIONS_KEY);
      return interactions ? JSON.parse(interactions).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })) : [];
    } catch (error) {
      console.error('Error loading user interactions:', error);
      return [];
    }
  }

  addUserInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>): void {
    try {
      const interactions = this.getUserInteractions();
      const newInteraction: UserInteraction = {
        ...interaction,
        id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      interactions.unshift(newInteraction);
      
      // Keep only the most recent interactions
      if (interactions.length > this.MAX_INTERACTIONS) {
        interactions.splice(this.MAX_INTERACTIONS);
      }

      safeStorage.setItem(this.USER_INTERACTIONS_KEY, JSON.stringify(interactions));
      this.updateJobPreferencesFromInteraction(newInteraction);
    } catch (error) {
      console.error('Error saving user interaction:', error);
    }
  }

  // Job Preferences Management
  getJobPreferences(): JobPreference {
    try {
      const preferences = safeStorage.getItem(this.JOB_PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : {
        categories: {},
        locations: {},
        companies: {},
        salaryRanges: {},
        keywords: {}
      };
    } catch (error) {
      console.error('Error loading job preferences:', error);
      return {
        categories: {},
        locations: {},
        companies: {},
        salaryRanges: {},
        keywords: {}
      };
    }
  }

  private updateJobPreferences(searchItem: SearchHistoryItem): void {
    const preferences = this.getJobPreferences();
    
    // Update category preferences
    if (searchItem.filters.category) {
      preferences.categories[searchItem.filters.category] = 
        (preferences.categories[searchItem.filters.category] || 0) + 1;
    }

    // Update location preferences
    if (searchItem.filters.location) {
      preferences.locations[searchItem.filters.location] = 
        (preferences.locations[searchItem.filters.location] || 0) + 1;
    }

    // Update salary range preferences
    if (searchItem.filters.salaryRange) {
      preferences.salaryRanges[searchItem.filters.salaryRange] = 
        (preferences.salaryRanges[searchItem.filters.salaryRange] || 0) + 1;
    }

    // Extract and update keywords from search query
    if (searchItem.query) {
      const keywords = searchItem.query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      keywords.forEach(keyword => {
        preferences.keywords[keyword] = (preferences.keywords[keyword] || 0) + 1;
      });
    }

    this.saveJobPreferences(preferences);
  }

  private updateJobPreferencesFromInteraction(interaction: UserInteraction): void {
    // This would be enhanced with actual job data to extract preferences
    // For now, we'll implement basic tracking
    const preferences = this.getJobPreferences();
    
    if (interaction.type === 'job_view' || interaction.type === 'job_save' || interaction.type === 'job_apply') {
      // In a real implementation, we'd fetch job details and update preferences
      // For now, we'll just track the interaction type
    }

    this.saveJobPreferences(preferences);
  }

  private saveJobPreferences(preferences: JobPreference): void {
    try {
      safeStorage.setItem(this.JOB_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving job preferences:', error);
    }
  }

  // Analytics and Insights
  getSearchAnalytics() {
    const history = this.getSearchHistory();
    const interactions = this.getUserInteractions();
    const preferences = this.getJobPreferences();

    return {
      totalSearches: history.length,
      totalInteractions: interactions.length,
      topCategories: this.getTopItems(preferences.categories, 5),
      topLocations: this.getTopItems(preferences.locations, 5),
      topKeywords: this.getTopItems(preferences.keywords, 10),
      recentSearches: history.slice(0, 10),
      searchFrequency: this.getSearchFrequency(history),
      clickThroughRate: this.calculateClickThroughRate(history)
    };
  }

  private getTopItems(items: { [key: string]: number }, limit: number) {
    return Object.entries(items)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  private getSearchFrequency(history: SearchHistoryItem[]) {
    const now = new Date();
    const last7Days = history.filter(item => 
      (now.getTime() - item.timestamp.getTime()) < 7 * 24 * 60 * 60 * 1000
    ).length;
    const last30Days = history.filter(item => 
      (now.getTime() - item.timestamp.getTime()) < 30 * 24 * 60 * 60 * 1000
    ).length;

    return {
      last7Days,
      last30Days,
      average7Days: last7Days / 7,
      average30Days: last30Days / 30
    };
  }

  private calculateClickThroughRate(history: SearchHistoryItem[]) {
    if (history.length === 0) return 0;
    
    const totalClicks = history.reduce((sum, item) => sum + item.clickedJobs.length, 0);
    const totalSearches = history.length;
    
    return totalSearches > 0 ? (totalClicks / totalSearches) * 100 : 0;
  }

  // Enhanced Recommendation Algorithm
  generateRecommendationScore(job: any): number {
    const preferences = this.getJobPreferences();
    const interactions = this.getUserInteractions();
    let score = 0;

    // Category preference score (weight: 30%)
    if (job.category && preferences.categories[job.category]) {
      score += (preferences.categories[job.category] / Math.max(...Object.values(preferences.categories))) * 30;
    }

    // Location preference score (weight: 20%)
    if (job.location && preferences.locations[job.location]) {
      score += (preferences.locations[job.location] / Math.max(...Object.values(preferences.locations))) * 20;
    }

    // Company preference score (weight: 15%)
    if (job.company && preferences.companies[job.company]) {
      score += (preferences.companies[job.company] / Math.max(...Object.values(preferences.companies))) * 15;
    }

    // Keyword matching score (weight: 25%)
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    let keywordScore = 0;
    Object.entries(preferences.keywords).forEach(([keyword, frequency]) => {
      if (jobText.includes(keyword)) {
        keywordScore += frequency;
      }
    });
    if (keywordScore > 0) {
      score += (keywordScore / Math.max(...Object.values(preferences.keywords))) * 25;
    }

    // Recency bonus (weight: 10%)
    const jobDate = new Date(job.postedDate || job.publishedDate);
    const daysSincePosted = (Date.now() - jobDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 10 - daysSincePosted) / 10;
    score += recencyScore * 10;

    return Math.min(100, Math.max(0, score));
  }

  // Clear data (for privacy/reset)
  clearSearchHistory(): void {
    safeStorage.removeItem(this.SEARCH_HISTORY_KEY);
  }

  clearUserInteractions(): void {
    safeStorage.removeItem(this.USER_INTERACTIONS_KEY);
  }

  clearJobPreferences(): void {
    safeStorage.removeItem(this.JOB_PREFERENCES_KEY);
  }

  clearAllData(): void {
    this.clearSearchHistory();
    this.clearUserInteractions();
    this.clearJobPreferences();
  }
}

export const searchHistoryService = new SearchHistoryService();