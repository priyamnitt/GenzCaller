const z = require('zod');

const UserSchema = z.object({
    firstName: z.string({ message: "First name should be a string" })
        .min(3, { message: "First name must be at least 3 characters long" })
        .max(100, { message: "First name must be at most 100 characters long" }),

    lastName: z.string({ message: "Last name should be a string" })
        .min(3, { message: "Last name must be at least 3 characters long" })
        .max(100, { message: "Last name must be at most 100 characters long" }),

    phoneNumber: z.string({ message: "Phone number should be a string" })
        .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" }),

    email: z.string({ message: "Email must be a string" })
        .min(3, { message: "Email must be at least 3 characters long" })
        .max(100, { message: "Email must be at most 100 characters long" })
        .email({ message: "Must be a valid email address" }),

    password: z.string({ message: "Password must be a string" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(100, { message: "Password must be at most 100 characters long" })
        .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/, {
            message: "Password must contain at least one uppercase letter, one number, and one special character."
        }),
});

module.exports = {
    UserSchema
};
