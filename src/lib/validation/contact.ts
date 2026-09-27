import { z } from "zod";

export const budgetOptions = ["Under $1,000", "$1,000 – $3,000", "$3,000 – $6,000", "$6,000+", "Not sure yet"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email: z.string().trim().email("Please enter a valid email address.").max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+()\d\s-]*$/, "Please enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  service: z.string().trim().max(80).optional().or(z.literal("")),
  budget: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please write at least 10 characters.").max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<keyof ContactInput, string>>;
};
