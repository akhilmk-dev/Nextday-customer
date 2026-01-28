import * as Yup from "yup";
import { addressValidation, cancelValidation, cityValidation, commentValidation, confirmPassword, confirmPasswordValidation, currentPasswordValidation, customerValidation, emailValidation, gstNumberValidation, loginUsername, monthlyDateValidation, nameValidation, newPasswordValidation, otpValidation, passwordValidation, phoneValidation, pickupApproxWeightValidation, pickupDateValidation, pickupFrequencyValidation, pickupScheduleFromValidation, pickupScheduleToValidation, pickUpTimeValidation, pincodeValidation, pincodeValidation2, ratingValidation, stateValidation, weeklyDayValidation } from "../commonValidation";

// --------------------- login section ----------------------
export const loginInitialValues = {
    email: "",
    password: "",
};

export const loginSchema = Yup.object().shape({
    email: loginUsername,
    password: passwordValidation
});
//--------------------- login section end --------------------

//--------------------- register section ----------------------
export const registerInitialValues = {
    email: "",
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword:""
};

export const registerSchema = Yup.object().shape({
    email: emailValidation,
    name: nameValidation,
    phoneNumber: phoneValidation,
    password: passwordValidation,
    confirmPassword: confirmPasswordValidation
});
//-------------------- register section end ---------------------


//------------------ login with otp section ---------------------
export const loginWithOTPInitialValues = {
    mobile: "",
}

export const loginWithOTP = Yup.object().shape({
    mobile: phoneValidation
});

export const loginWithOTPInitialValues2 = {
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
}

export const loginWithOTP2 = Yup.object().shape({
    otp1: otpValidation,
    otp2: otpValidation,
    otp3: otpValidation,
    otp4: otpValidation,
    otp5: otpValidation,
});


//----------------- login with otp section end--------------------- 

//----------------- forgot password section end--------------------- 

export const forgotPasswordMobileInitialValues = {
    mobile: "",
}

export const forgotPasswordMobileSchema = Yup.object().shape({
    mobile: phoneValidation
});
//----------------- forgot password section end--------------------- 


export const forgotPasswordOTPInitialValues = {
    password: "",
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",

}

export const forgotPasswordOTPSchema = Yup.object().shape({
    password: passwordValidation,
    otp1: otpValidation,
    otp2: otpValidation,
    otp3: otpValidation,
    otp4: otpValidation,
    otp5: otpValidation,
});

//----------------- profile edit start --------------------- 

export const profileEditSchema = Yup.object().shape({
    email:emailValidation,
    fullName:nameValidation,
    gstNumber:gstNumberValidation,
    mobile:phoneValidation
})

export const profileEditSchema2 = Yup.object().shape({
    email:emailValidation,
    fullName:nameValidation,
    address:addressValidation,
    mobile:phoneValidation
})

//----------------- change password schema --------------------- 
export const changePasswordSchema = Yup.object().shape({
    currentPassword:currentPasswordValidation,
    newPassword:newPasswordValidation,
    reEnterNewPassword:confirmPassword
})

// create recurring pickup
export const recurringSchema = Yup.object().shape({
    // pincode : pincodeValidation2,
    // pickupTime:pickUpTimeValidation,
    // pickupDate:pickupDateValidation,
    frequency:pickupFrequencyValidation,
    approxWeight:pickupApproxWeightValidation,
    pickupScheduleFrom:pickupScheduleFromValidation,
    pickupScheduleTo:pickupScheduleToValidation,
    // monthlyDate:monthlyDateValidation,
    // weeklyDay:weeklyDayValidation
});

export const recurringSchema2 = Yup.object().shape({
    pincode : pincodeValidation2,
    pickupTime:pickUpTimeValidation,
    pickupDate:pickupDateValidation,
    frequency:pickupFrequencyValidation,
    customerId: customerValidation
});

export const recurringInitialValues = {
    // pincode : '',
    pickupTime:'',
    pickupDate:'',
    frequency:'',
    approxWeight:"",
    pickupScheduleFrom:'',
    pickupScheduleTo:"",
    weeklyDay:[],
    monthlyDate:"",
    isActive:true
}

export const recurringInitialValues2 = {
    pincode : '',
    pickupTime:'',
    pickupDate:'',
    frequency:'',
    customerId:''
}

// location finder
export const locationFinderInitialValues = {
    state:'',
    city:'',
    pincode:''
}

export const locationFinderValidationSchema = Yup.object().shape({
    state:stateValidation,
    city:cityValidation,
    pincode:pincodeValidation
});

// rating for booking

export const ratingInitialValues = {
    rating : 0,
    feedback:''
}
export const cancelInitialValues={
    cancelReason:""
}
export const cancelSchema = Yup.object().shape({
    cancelReason:cancelValidation
});

export const ratingSchema = Yup.object().shape({
    rating:ratingValidation,
    feedback:commentValidation
})
