/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"; // Indicates this component is a client-side rendered component
import { useEffect } from "react";
import { useForm } from "react-hook-form"; // React Hook Form for managing form state and validation
import Link from "next/link"; // Next.js link component for navigation
import { Button } from "@/components/ui/button"; // UI button component
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"; // Card components for layout and styling
import { Input } from "@/components/ui/input"; // UI input component
import { Label } from "@/components/ui/label"; // UI label component
import { toast } from "@/hooks/use-toast"; // Custom toast hook for notifications
import { useRouter } from "next/navigation"; // Next.js hook for programmatic navigation

import { useAuthState, useSignInWithEmailAndPassword } from "react-firebase-hooks/auth"; // Firebase hooks for managing authentication
import { auth } from "@/lib/firebase/config"; // Firebase authentication configuration

// Interface for the login form values
interface LoginFormValues {
    email: string; // Email address
    password: string; // Password
}

// Main LoginPage component
const LoginPage = () => {
    // React Hook Form setup
    const {
        register, // Function to register inputs with React Hook Form
        handleSubmit, // Function to handle form submission
        formState: { errors, isSubmitting }, // Destructure form state to access errors and submission state
    } = useForm<LoginFormValues>();

    const router = useRouter(); // Next.js router for navigation

    // Firebase authentication hooks
    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
    const [initialUser] = useAuthState(auth); // Check if a user is already logged in

    // Redirect to the home page if the user is already logged in
    useEffect(() => {
        if (initialUser) {
            router.push("/"); // Navigate to the home page
        }
    }, [initialUser, router]);

    // Prevent rendering the login page while redirecting
    if (initialUser) {
        return null;
    }

    // Function to generate error messages based on Firebase error codes
    const getErrorMessage = (error: any) => {
        if (!error) return null; // Return null if there is no error
        let errorMessage = "";
        switch (error.code) {
            case "auth/user-not-found":
                errorMessage = "No user found with this email.";
                break;
            case "auth/invalid-credential":
                errorMessage = "Invalid credentials. Please try again.";
                break;
            case "auth/too-many-requests":
                errorMessage = "Too many login attempts. Please try again later.";
                break;
            default:
                errorMessage = "An error occurred. Please try again.";
                break;
        }
        toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive", // Toast style for error messages
        });
    };

    // Form submission handler
    const onSubmit = async (data: LoginFormValues) => {
        try {
            await signInWithEmailAndPassword(data.email, data.password); // Attempt to log in the user
            if (!error) {
                router.push("/"); // Navigate to the home page if successful
            }
        } catch (e) {
            console.error(e); // Log any errors
        }
    };

    return (
        <main className="flex h-screen w-full items-center bg-sidebar justify-center px-4">
            {/* Card layout for the login form */}
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle> {/* Login title */}
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Form to handle user login */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-4">
                            {/* Email input */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    {...register("email", { required: "Email is required" })} // Validation rule
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p> // Error message for email
                                )}
                            </div>
                            {/* Password input */}
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password", { required: "Password is required" })} // Validation rule
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">
                                        {errors.password.message}
                                    </p> // Error message for password
                                )}
                            </div>
                            {/* Login button */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
                                disabled={isSubmitting} // Disable the button while submitting
                            >
                                {isSubmitting ? "Logging in..." : "Login"}
                            </Button>
                        </div>
                    </form>
                    {/* Display error message if login fails */}
                    {error && (
                        <p className="mt-4 text-sm text-red-500">{getErrorMessage(error)}</p>
                    )}
                    {/* Link to the signup page */}
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
};

export default LoginPage;