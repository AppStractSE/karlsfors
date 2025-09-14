import { twMerge } from "tailwind-merge";

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const renderSteps = () => {
    const steps = [];
    for (let i = 1; i <= totalSteps; i++) {
      steps.push(
        <div
          key={i}
          className={twMerge(
            "h-1 flex-1 rounded-full transition-all duration-100 ease-in-out",
            i < currentStep ? "bg-primary" : i === currentStep ? "bg-primary" : "bg-primary/50",
          )}
        ></div>,
      );
    }
    return steps;
  };
  return <div className="flex p-2 gap-2">{renderSteps()}</div>;
};

export default ProgressBar;
