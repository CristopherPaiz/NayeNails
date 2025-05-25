import * as LucideIcons from "lucide-react";

export const DynamicIcon = ({ name, ...props }) => {
  if (!name) return null;

  const IconComponent = LucideIcons[name];
  if (!IconComponent) return null;

  return <IconComponent {...props} />;
};
