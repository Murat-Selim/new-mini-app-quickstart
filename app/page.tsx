"use client";
import { useState, useEffect } from "react";
import { useQuickAuth, useMiniKit } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    displayName: string;
    username: string;
    pfpUrl?: string;
  };
  message?: string;
}

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  author: {
    fid: number;
    displayName: string;
    username: string;
    pfpUrl?: string;
  };
  votes: number;
  createdAt: string;
}

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [ideaCategory, setIdeaCategory] = useState("DeFi");
  const [error, setError] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [activeTab, setActiveTab] = useState("trending");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("home"); // home, tasks, leaderboard, profile

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);
 
  const { data: authData, isLoading: isAuthLoading, error: authError } = useQuickAuth<AuthResponse>(
    "/api/auth",
    { method: "GET" }
  );

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ideas");
      if (response.ok) {
        const data = await response.json();
        setIdeas(data);
      } else {
        // If API doesn't exist or returns error, initialize with empty array
        setIdeas([]);
      }
    } catch (err) {
      console.error("Failed to load ideas:", err);
      // Initialize with empty array if API call fails
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  // Load ideas when component mounts
  useEffect(() => {
    loadIdeas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check authentication first
    if (isAuthLoading) {
      setError("Please wait while we verify your identity...");
      return;
    }

    if (authError || !authData?.success) {
      setError("Please authenticate to submit ideas");
      return;
    }

    if (!ideaTitle.trim()) {
      setError("Please enter an idea title");
      return;
    }

    if (!ideaDescription.trim()) {
      setError("Please enter an idea description");
      return;
    }

    try {
      // Call API to save the idea
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: ideaTitle,
          description: ideaDescription,
          category: ideaCategory,
          author: {
            fid: authData.user!.fid,
            displayName: authData.user!.displayName || "Anonymous",
            username: authData.user!.username || "anonymous",
            pfpUrl: authData.user!.pfpUrl
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit idea");
      }

      const newIdea = await response.json();
      
      // Add to ideas list at the beginning
      setIdeas([newIdea, ...ideas]);
      
      // Reset form
      setIdeaTitle("");
      setIdeaDescription("");
      setIdeaCategory("DeFi");
      
      // Show success message
      setError("Idea submitted successfully!");
    } catch (err) {
      console.error("Failed to submit idea:", err);
      setError("Failed to submit idea. Please try again.");
    }
  };

  const handleVote = async (ideaId: number) => {
    if (isAuthLoading || authError || !authData?.success) {
      setError("Please authenticate to vote");
      return;
    }

    try {
      // Call API to vote on the idea
      const response = await fetch(`/api/ideas/${ideaId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to vote on idea");
      }

      const updatedIdea = await response.json();
      
      // Update the idea in the list
      setIdeas(ideas.map(idea => 
        idea.id === ideaId ? updatedIdea : idea
      ));
    } catch (err) {
      console.error("Failed to vote on idea:", err);
      setError("Failed to vote on idea. Please try again.");
    }
  };

  // Filter ideas based on active tab
  const filteredIdeas = ideas.filter(idea => {
    if (activeTab === "trending") return true;
    if (activeTab === "new") return true; // All ideas are "new" in this demo
    return idea.category === activeTab;
  }).sort((a, b) => {
    if (activeTab === "trending") {
      return b.votes - a.votes; // Sort by votes descending
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Sort by date descending
  });

  // Render content based on current page
  const renderPageContent = () => {
    switch (currentPage) {
      case "home":
        return (
          <div className={styles.pageContent}>
            {/* Header */}
            <div className={styles.header}>
              <h1 className={styles.title}>{minikitConfig.miniapp.name}</h1>
              <p className={styles.subtitle}>
                Share, discover, and validate Web3 ideas with on-chain verification
              </p>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === "trending" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("trending")}
              >
                Trending
              </button>
              <button 
                className={`${styles.tab} ${activeTab === "new" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("new")}
              >
                New
              </button>
              <button 
                className={`${styles.tab} ${activeTab === "DeFi" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("DeFi")}
              >
                DeFi
              </button>
              <button 
                className={`${styles.tab} ${activeTab === "NFTs" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("NFTs")}
              >
                NFTs
              </button>
            </div>

            {/* Submit Idea Form */}
            <div className={styles.ideaFormContainer}>
              <h2 className={styles.sectionTitle}>Submit Your Idea</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="text"
                  placeholder="Idea title"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className={styles.input}
                />
                
                <textarea
                  placeholder="Describe your idea in detail..."
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  className={styles.textarea}
                />
                
                <select
                  value={ideaCategory}
                  onChange={(e) => setIdeaCategory(e.target.value)}
                  className={styles.select}
                >
                  <option value="DeFi">DeFi</option>
                  <option value="NFTs">NFTs</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Social">Social</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Governance">Governance</option>
                  <option value="Privacy">Privacy</option>
                  <option value="Other">Other</option>
                </select>
                
                {error && <p className={styles.error}>{error}</p>}
                
                <button type="submit" className={styles.submitButton} disabled={isAuthLoading}>
                  {isAuthLoading ? "Submitting..." : "SUBMIT IDEA"}
                </button>
              </form>
            </div>

            {/* Ideas List */}
            <div className={styles.ideasContainer}>
              <h2 className={styles.sectionTitle}>
                {activeTab === "trending" ? "Trending Ideas" : 
                 activeTab === "new" ? "New Ideas" : 
                 `${activeTab} Ideas`}
              </h2>
              
              {loading ? (
                <div className={styles.loading}>Loading ideas...</div>
              ) : (
                <div className={styles.ideasList}>
                  {filteredIdeas.length > 0 ? (
                    filteredIdeas.map((idea) => (
                      <div key={idea.id} className={styles.ideaCard}>
                        <div className={styles.ideaHeader}>
                          <div className={styles.authorInfo}>
                            <span className={styles.authorName}>{idea.author.displayName}</span>
                            <span className={styles.categoryTag}>{idea.category}</span>
                          </div>
                          <div className={styles.voteSection}>
                            <span className={styles.voteCount}>{idea.votes} votes</span>
                            <button 
                              onClick={() => handleVote(idea.id)}
                              className={styles.voteButton}
                            >
                              Vote
                            </button>
                          </div>
                        </div>
                        <h3 className={styles.ideaTitle}>{idea.title}</h3>
                        <p className={styles.ideaDescription}>{idea.description}</p>
                        <div className={styles.ideaFooter}>
                          <span className={styles.timeAgo}>
                            {new Date(idea.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noIdeas}>
                      <p>No ideas found in this category. Be the first to submit one!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case "tasks":
        return (
          <div className={styles.pageContent}>
            <div className={styles.header}>
              <h1 className={styles.title}>Tasks</h1>
              <p className={styles.subtitle}>Complete tasks to earn rewards</p>
            </div>
            <div className={styles.tasksContainer}>
              <div className={styles.taskCard}>
                <h3 className={styles.taskTitle}>Submit your first idea</h3>
                <p className={styles.taskDescription}>Share an innovative Web3 idea</p>
                <button className={styles.taskButton}>Start</button>
              </div>
              <div className={styles.taskCard}>
                <h3 className={styles.taskTitle}>Vote on 5 ideas</h3>
                <p className={styles.taskDescription}>Help the community by voting</p>
                <button className={styles.taskButton}>Start</button>
              </div>
              <div className={styles.taskCard}>
                <h3 className={styles.taskTitle}>Invite a friend</h3>
                <p className={styles.taskDescription}>Grow the IdeaBoard community</p>
                <button className={styles.taskButton}>Share</button>
              </div>
            </div>
          </div>
        );
      case "leaderboard":
        return (
          <div className={styles.pageContent}>
            <div className={styles.header}>
              <h1 className={styles.title}>Leaderboard</h1>
              <p className={styles.subtitle}>Top contributors to the IdeaBoard</p>
            </div>
            <div className={styles.leaderboardContainer}>
              <div className={styles.leaderboardItem}>
                <div className={styles.leaderboardRank}>1</div>
                <div className={styles.leaderboardInfo}>
                  <span className={styles.leaderboardName}>Alex Chen</span>
                  <span className={styles.leaderboardPoints}>1240 pts</span>
                </div>
              </div>
              <div className={styles.leaderboardItem}>
                <div className={styles.leaderboardRank}>2</div>
                <div className={styles.leaderboardInfo}>
                  <span className={styles.leaderboardName}>Jordan Kim</span>
                  <span className={styles.leaderboardPoints}>980 pts</span>
                </div>
              </div>
              <div className={styles.leaderboardItem}>
                <div className={styles.leaderboardRank}>3</div>
                <div className={styles.leaderboardInfo}>
                  <span className={styles.leaderboardName}>Taylor Reed</span>
                  <span className={styles.leaderboardPoints}>875 pts</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className={styles.pageContent}>
            <div className={styles.header}>
              <h1 className={styles.title}>Profile</h1>
              <p className={styles.subtitle}>Your IdeaBoard activity</p>
            </div>
            <div className={styles.profileContainer}>
              <div className={styles.profileHeader}>
                <div className={styles.profileImage}>
                  {authData?.user?.pfpUrl ? (
                    <img src={authData.user.pfpUrl} alt="Profile" className={styles.profileImage} />
                  ) : (
                    <div className={styles.profilePlaceholder}>👤</div>
                  )}
                </div>
                <div className={styles.profileInfo}>
                  <h2 className={styles.profileName}>
                    {authData?.user?.displayName || "Anonymous User"}
                  </h2>
                  <p className={styles.profileUsername}>
                    @{authData?.user?.username || "anonymous"}
                  </p>
                </div>
              </div>
              <div className={styles.profileStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>5</span>
                  <span className={styles.statLabel}>Ideas</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>24</span>
                  <span className={styles.statLabel}>Votes</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>1420</span>
                  <span className={styles.statLabel}>Points</span>
                </div>
              </div>
              <div className={styles.profileActions}>
                <button className={styles.profileButton}>Edit Profile</button>
                <button className={styles.profileButton}>Settings</button>
                <button className={styles.profileButton}>Logout</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topHeader}>
        <div className={styles.headerLeft}>
          {authData?.user?.pfpUrl ? (
            <img src={authData.user.pfpUrl} alt="Profile" className={styles.profileIcon} />
          ) : (
            <div className={styles.profileIconPlaceholder}>👤</div>
          )}
        </div>
        <div className={styles.headerCenter}>
          <h1 className={styles.appTitle}>{minikitConfig.miniapp.name}</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.menuIcon}>☰</button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {renderPageContent()}
      </div>

      {/* Bottom Navigation */}
      <div className={styles.bottomNav}>
        <button 
          className={`${styles.navItem} ${currentPage === "home" ? styles.activeNavItem : ""}`}
          onClick={() => setCurrentPage("home")}
        >
          <div className={styles.navIcon}>🏠</div>
          <span className={styles.navLabel}>Home</span>
        </button>
        <button 
          className={`${styles.navItem} ${currentPage === "tasks" ? styles.activeNavItem : ""}`}
          onClick={() => setCurrentPage("tasks")}
        >
          <div className={styles.navIcon}>✅</div>
          <span className={styles.navLabel}>Tasks</span>
        </button>
        <button 
          className={`${styles.navItem} ${currentPage === "leaderboard" ? styles.activeNavItem : ""}`}
          onClick={() => setCurrentPage("leaderboard")}
        >
          <div className={styles.navIcon}>🏆</div>
          <span className={styles.navLabel}>Leaderboard</span>
        </button>
        <button 
          className={`${styles.navItem} ${currentPage === "profile" ? styles.activeNavItem : ""}`}
          onClick={() => setCurrentPage("profile")}
        >
          <div className={styles.navIcon}>👤</div>
          <span className={styles.navLabel}>Profile</span>
        </button>
      </div>
    </div>
  );
}