
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { deployToCurrentTarget, getCurrentDeploymentTarget } from '@/services/deploymentService';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DeployButtonProps {
  className?: string;
}

const DeployButton = ({ className = '' }: DeployButtonProps) => {
  const [isDeploying, setIsDeploying] = useState(false);
  
  const handleDeploy = async () => {
    const target = getCurrentDeploymentTarget();
    
    setIsDeploying(true);
    try {
      const result = await deployToCurrentTarget();
      
      if (result.success) {
        toast.success(`Deployment successful`, {
          description: `Successfully deployed to ${target.domain}`
        });
      } else {
        toast.error(`Deployment failed`, {
          description: `Failed to deploy to ${target.domain}`
        });
      }
    } catch (error) {
      toast.error(`Deployment error`, {
        description: `An error occurred while deploying to ${target.domain}`
      });
      console.error("Deployment error:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Button 
      onClick={handleDeploy} 
      className={className}
      disabled={isDeploying}
    >
      {isDeploying ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deploying...
        </>
      ) : (
        <>Update</>
      )}
    </Button>
  );
};

export default DeployButton;
