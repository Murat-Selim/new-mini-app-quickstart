"use client";

import { useComposeCast } from '@coinbase/onchainkit/minikit';
import { minikitConfig } from "../../minikit.config";
import styles from "./page.module.css";

export default function Success() {
  const { composeCastAsync } = useComposeCast();
  
  const handleShare = async () => {
    try {
      const text = `Just shared a new Web3 idea on ${minikitConfig.miniapp.name}! Join me in shaping the future of decentralized innovation. `;
      
      const result = await composeCastAsync({
        text: text,
        embeds: [process.env.NEXT_PUBLIC_URL || ""]
      });

      if (result?.cast) {
        console.log("Cast created successfully:", result.cast.hash);
      } else {
        console.log("User cancelled the cast");
      }
    } catch (error) {
      console.error("Error sharing cast:", error);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} type="button">
        ✕
      </button>
      
      <div className={styles.content}>
        <div className={styles.successMessage}>
          <div className={styles.checkmark}>
            <div className={styles.checkmarkCircle}>
              <div className={styles.checkmarkStem}></div>
              <div className={styles.checkmarkKick}></div>
            </div>
          </div>
          
          <h1 className={styles.title}>Idea Submitted Successfully!</h1>
          
          <p className={styles.subtitle}>
            Your Web3 idea has been posted to the IdeaBoard!<br />
            Thank you for contributing to the decentralized innovation community.
          </p>

          <button onClick={handleShare} className={styles.shareButton}>
            SHARE ON FARCASTER
          </button>
          
          <div className={styles.nextSteps}>
            <h3>What's next?</h3>
            <ul>
              <li>Check back to see community votes</li>
              <li>Engage with other innovators</li>
              <li>Refine your idea based on feedback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}