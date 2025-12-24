import { Step, StepLabel, Stepper, StepConnector, stepConnectorClasses } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { CustomStepIcon } from "./CustomStepIcon";

const dateTimeformater = (isoString) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
  return `${formattedDate} | ${formattedTime}`;
};

// const stepData = [
//   {
//     name: "bookingcreated",
//     hub: "booking created",
//     check: 0
//   },
//   {
//     name: "intransit",
//     check: 0,
//     hub: "In transit"
//   },
//   {
//     name: "outfordelivery",
//     hub: "Out for delivery",
//     check: 0
//   },
//   {
//     name: "delivered",
//     hub: "Delivered",
//     check: 0
//   },
// ];

const stepData = [
  {
    name: "starting hub",
    hub: "starting hub",
    check: 0
  },
  {
    name: "Ending gub",
    check: 0,
    hub: "Ending hub"
  },
  
];

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#1BA169',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#1BA169',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#eaeaf0',
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

const CheckoutStepper = ({ stepsConfig = [] }) => {
  const cardData = stepData.map((step, index) => {
    if (stepsConfig[index]) {
      return {
        name: stepsConfig[index].hub,
        description: dateTimeformater(stepsConfig[index].datetime),
        status: stepsConfig[index].hub,
        hub: stepsConfig[index].hub,
        check: 2
      };
    }
    return step;
  });

  const [activeStep, setActiveStep] = useState(cardData.filter(item => item.check === 2).length - 1);

  return (
    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }} className="hide-scrollbar">
      <div style={{ minWidth: '380px' }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<QontoConnector />}
          className="my-5"
        >
          {cardData.map((item) => (
            <Step key={item.name}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                <p className="font-sansation text-custom-green">{item.status}</p>
                <p className="font-sansation text-sm" style={{fontSize:"12px"}}>{item?.description ? item?.description : "-"}</p>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
    </div>
  );
};

export default CheckoutStepper;


  // const [margins, setMargins] = useState({
  //   marginLeft: 0,
  //   marginRight: 0,
  // });
  // const stepRef = useRef([]);

  // useEffect(() => {
  //   if (stepRef.current.length > 0) {
  //     const firstStep = stepRef.current[0];
  //     const lastStep = stepRef.current[stepRef.current.length - 1];

  //     if (firstStep && lastStep) {
  //       setMargins({
  //         marginLeft: firstStep.offsetWidth / 2,
  //         marginRight: lastStep.offsetWidth / 2,
  //       });
  //     }
  //   }
  // }, [cardData]);

  // const calculateProgressBarWidth = () => {
  //   const completedSteps = cardData.filter((step) => step.status === 2).length;
  //   return (completedSteps / (cardData.length - 1)) * 100;
  // };

  // return (
  //   <div className="relative flex justify-between  mb-5 mt-5">
  //     {cardData.map((step, index) => {
  //       const isComplete = step?.check === 2;
  //       const isInProgress = step?.check === 1;

  //       return (
  //         <div
  //           key={`${step.name}-${index}`}
  //           ref={(el) => (stepRef.current[index] = el)}
  //           className={`flex flex-col items-center  ${
  //             isComplete ? "complete" : ""
  //           } ${isInProgress ? "in-progress" : ""}`}
  //           style={{
  //             justifyContent:
  //               index === 0
  //                 ? "flex-start"
  //                 : index === cardData.length - 1
  //                 ? "flex-end"
  //                 : "center",
  //           }}
  //         >
  //           <div
  //             className={`w-4 h-4 rounded-full flex justify-center  items-center mb-2 z-10 border ${
  //               isComplete
  //                 ? "bg-custom-green border-custom-green"
  //                 : isInProgress
  //                 ? "border-custom-green bg-custom-white"
  //                 : "border-gray-300 bg-custom-white"
  //             }`}
  //           >
  //             {isComplete ? (
  //               <span className="text-white text-[0.5rem]">
  //                 <FaCheck />
  //               </span>
  //             ) : isInProgress ? (
  //               ""
  //             ) : (
  //               ""
  //             )}
  //           </div>
  //           <div className={`text-[0.7rem] font-sansation font-regular text-custom-green `}>
  //             {step.name ? step?.name : ""}
  //           </div>
  //           <div className={`text-[0.7rem] font-sansation font-regular ${step?.description ? "": "py-2"}`}>
  //             {step?.description ? step?.description: ''}
  //           </div>
  //         </div>
  //       );
  //     })}

  //     <div
  //       className="absolute top-[13%] left-0 h-[0.01rem] bg-gray-300"
  //       style={{
  //         width: `calc(100% - ${margins.marginLeft + margins.marginRight}px)`,
  //         marginLeft: margins.marginLeft,
  //         marginRight: margins.marginRight,
  //       }}
  //     >
  //       <div
  //         className={`h-full ${
  //           cardData.some((step) => step?.check === 2)
  //             ? "bg-custom-green"
  //             : "bg-gray-300"
  //         } transition-all duration-200 ease-in`}
  //         style={{
  //           width: `${calculateProgressBarWidth()}%`,
  //           // border: stepsConfig.some((step) => step.status === 1) ? "1px dashed green" : "none",
  //         }}
  //       ></div>
  //     </div>
  //   </div>
  // );



// import React, { useState } from "react";
// import "./stepper.css";
// import { TiTick } from "react-icons/ti";
// const CheckoutStepper = () => {
//   const steps = ["Customer Info", "Shipping Info", "Payment", "Step 4"];
//   const [currentStep, setCurrentStep] = useState(1);
//   const [complete, setComplete] = useState(false);
//   return (
//     <>
//       <div className="flex justify-center">
//         {steps?.map((step, i) => (
//           <div
//             key={i}
//             className={`step-item ${currentStep === i + 1 && "active"} ${
//               (i + 1 < currentStep || complete) && "complete"
//             } `}
//           >
//             <div className="step">
//               {i + 1 < currentStep || complete ? <TiTick size={24} /> : ""}
//             </div>
//             <p className="text-gray-500">{step}</p>
//           </div>
//         ))}
//       </div>
//       {!complete && (
//         <button
//           className="btn"
//           onClick={() => {
//             currentStep === steps.length
//               ? setComplete(true)
//               : setCurrentStep((prev) => prev + 1);
//           }}
//         >
//           {currentStep === steps.length ? "Finish" : "Next"}
//         </button>
//       )}
//     </>
//   );
// };

// export default CheckoutStepper;
