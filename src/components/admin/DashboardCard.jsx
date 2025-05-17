import { DynamicIcon } from "../../utils/DynamicIcon";

const DashboardCard = ({ title, value, iconName, iconBgClass = "bg-primary/10 dark:bg-primary/20", iconColorClass = "text-primary" }) => {
  return (
    <div className="bg-background dark:bg-slate-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex items-start space-x-4">
      <div className={`p-3 rounded-lg ${iconBgClass}`}>
        <DynamicIcon name={iconName} className={`w-7 h-7 ${iconColorClass}`} />
      </div>
      <div>
        <p className="text-sm text-textSecondary dark:text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-textPrimary dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
