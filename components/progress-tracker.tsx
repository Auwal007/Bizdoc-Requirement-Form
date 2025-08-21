import { cn } from "@/lib/utils"

interface ProgressTrackerProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function ProgressTracker({ currentStep, totalSteps, steps }: ProgressTrackerProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn("h-0.5 w-16 mx-2 transition-colors", index < currentStep ? "bg-primary" : "bg-muted")}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}: {steps[currentStep]}
        </p>
      </div>
    </div>
  )
}
