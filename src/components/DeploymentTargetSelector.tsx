
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  getDeploymentTargets, 
  setDeploymentTarget, 
  getCurrentDeploymentTarget,
  DeploymentTarget 
} from '@/services/deploymentService';

interface DeploymentTargetSelectorProps {
  onChange?: (target: DeploymentTarget) => void;
}

const DeploymentTargetSelector = ({ onChange }: DeploymentTargetSelectorProps) => {
  const targets = getDeploymentTargets();
  const [selectedTarget, setSelectedTarget] = useState<DeploymentTarget>(
    getCurrentDeploymentTarget().id
  );

  const handleChange = (value: string) => {
    const target = value as DeploymentTarget;
    setSelectedTarget(target);
    setDeploymentTarget(target);
    if (onChange) {
      onChange(target);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Deploy to:
      </label>
      <Select value={selectedTarget} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select deployment target" />
        </SelectTrigger>
        <SelectContent>
          {targets.map((target) => (
            <SelectItem key={target.id} value={target.id}>
              {target.domain} ({target.label})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DeploymentTargetSelector;
