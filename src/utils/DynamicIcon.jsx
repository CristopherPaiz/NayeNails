import * as LucideIcons from "lucide-react";

export const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = name && LucideIcons[name] ? LucideIcons[name] : null;
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};
