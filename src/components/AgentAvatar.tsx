
import React from 'react';
import { cn } from "@/lib/utils";
import { Agent } from '@/lib/types';
import { CheckCircle2 } from "lucide-react";

interface AgentAvatarProps {
  agent: Agent;
  size?: 'sm' | 'md' | 'lg';
  showVerified?: boolean;
  className?: string;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agent,
  size = 'md',
  showVerified = true,
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  // Verified badge positioning based on size
  const badgePositions = {
    sm: '-bottom-0.5 -right-0.5 w-3.5 h-3.5',
    md: '-bottom-1 -right-1 w-4 h-4',
    lg: '-bottom-1 -right-1 w-5 h-5'
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div 
        className={cn(
          "rounded-full overflow-hidden border-2 transition-all duration-300", 
          sizeClasses[size],
          `border-[${agent.color}]`
        )}
        style={{ borderColor: agent.color }}
      >
        <img 
          src={agent.avatarUrl} 
          alt={agent.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {showVerified && agent.verified && (
        <span className={cn("absolute block", badgePositions[size])}>
          <CheckCircle2 
            className="w-full h-full text-primary fill-white"
          />
        </span>
      )}
    </div>
  );
};

export default AgentAvatar;
