import { DynamicIcon } from "../../utils/DynamicIcon";

const ScrollArrow = ({ showArrow, bg = "bg-primary", bgDark = "dark:bg-background", icon = "Star", color = "text-white" }) => {
  const styleShowArrow = !showArrow ? "border" : "";
  return (
    <div className={`size-24 ${bg} ${bgDark} absolute top-0 -mt-10 rounded-full flex justify-center items-center`}>
      {showArrow ? (
        <div className="animate-bounce -mt-9 flex flex-col items-center">
          <DynamicIcon name="ArrowDown" className={`size-8 ${color}`} />
        </div>
      ) : (
        <div className={`flex flex-col justify-center items-center ${color}`}>
          <div className={`size-20 mt-2 ${bg} ${bgDark} absolute top-0 rounded-full flex justify-center items-center ${styleShowArrow}`}>
            <DynamicIcon name={icon} className={`size-12 ${color}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollArrow;
