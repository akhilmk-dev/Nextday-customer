// this is a file for handle formik validation


import * as Yup from "yup";



const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //check for contain "@" and "." in the email
const mobileRegex = /^[0-9]{10}$/;


export const nameValidation = Yup.string()
  .required('Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name cannot exceed 50 characters');

export const emailValidation = Yup.string()
  .matches(emailRegex, "Invalid email address")
  .email('Invalid email address')
  .required('Email is required');

export const loginUsername = Yup.string().test('email', function (value) {
  const { path, createError } = this;

  if (!value) {
    return createError({ path, message: 'Username is required' });
  }

  // Check if input is numeric (possible mobile number)
  const isNumeric = /^[0-9]+$/.test(value.trim());

  if (isNumeric) {
    // Validate mobile number
    if (!mobileRegex.test(value.trim())) {
      return createError({ path, message: 'Invalid mobile number' });
    }
  } else {
    // Validate email address
    if (!emailRegex.test(value.trim())) {
      return createError({ path, message: 'Invalid email address' });
    }
  }
  return true;
})

export const passwordValidation = Yup.string()
  .min(6, "Must be at least 6 characters")
  .required('Password is required');

export const confirmPassword = Yup.string()
  .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
  .required('Confirm Password is required');

export const newPasswordValidation = Yup.string()
  .min(6, "Must be at least 6 characters")
  .required('New Password is required');

export const currentPasswordValidation = Yup.string()
  .required('Current Password is required');

export const phoneValidation = Yup.string()
  .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
  .required('Phone number is required');

export const pincodeValidation = Yup.string().required("Pincode is required");
export const pincodeValidation2 = Yup.string()
  .required("Pincode is required")
  .length(6, "Pincode must be exactly 6 characters")

export const addressValidation = Yup.string()
  .required("Address is required");

export const addressTypeValidation = Yup.string()
  .required("Please select an address type");

export const locationValidation = Yup.string().required("Location is required")

export const otpValidation = Yup.string()
  .required("OTP is required")

export const orderidTrackingidValidation = Yup.string()
  .required("OTP is required")

export const gstNumberValidation = Yup.string()
  .required("Gst number is required")

export const cityValidation = Yup.string()
  .required("City is required")

export const stateValidation = Yup.string()
  .required("State is required")

export const countryValidation = Yup.string().required("Country is required");

export const pickUpTimeValidation = Yup.string()
  .required("Pickup time is required")

export const pickupApproxWeightValidation = Yup.string().required("Actual weight is required");

export const pickupScheduleFromValidation = Yup.string().required("schedule from time is required")

export const pickupScheduleToValidation = Yup.string()
  .required("Schedule to time is required")
  .test("is-after-from", "Schedule to time must be after the schedule from time", function (value) {
    const { pickupScheduleFrom } = this.parent; // Get the 'from' time from the parent form values

    if (!value || !pickupScheduleFrom) return true; // If one of the fields is empty, skip this check

    // Parse the 'from' and 'to' time into Date objects (assuming HH:mm format, adjust parsing if needed)
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(num => parseInt(num, 10));
      const now = new Date();
      now.setHours(hours, minutes, 0, 0); // Set the current date with the specified hours and minutes
      return now;
    };

    const fromTime = parseTime(pickupScheduleFrom);
    const toTime = parseTime(value);

    return toTime > fromTime; // Check if "to" time is after "from" time
  });

export const pickupFrequencyValidation = Yup.string()
  .required("Frequency is required");

export const monthlyDateValidation = Yup.string()
  .when("frequency", {
    is: "Monthly", 
    then: Yup.string().required("Monthly date is required"), 
    otherwise: Yup.string().notRequired(),
  })

// Weekly Day validation, required only if frequency is "Weekly"
export const weeklyDayValidation = Yup.array()
  .when("frequency", {
    is: "Weekly", // condition: when frequency is "Weekly"
    then: Yup.array().min(1, "At least one day must be selected").required("Weekly days are required"), // make weekly days required
    otherwise: Yup.array().notRequired(), // otherwise it's not required
  });

export const customerValidation = Yup.string().required("Customer is required")
export const pickupDateValidation = Yup.date()
  .required('Date is required')
  .typeError('Invalid date format')

export const commentValidation = Yup.string().required("Comment is required");
export const ratingValidation = Yup.number().required("Rating is required")
export const cancelValidation = Yup.string().required("Reason is required")

// export { nameValidation, orderidTrackingidValidation, emailValidation, otpValidation, passwordValidation, phoneValidation, pincodeValidation, addressValidation, addressTypeValidation };    