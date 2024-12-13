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

import { useAuthState, useSignInWithEmailAndPassword, useSignInWithGoogle } from "react-firebase-hooks/auth"; // Firebase hooks for managing authentication
import { auth, db, googleAuthProvider } from "@/lib/firebase/config"; // Firebase authentication configuration and Google provider
import { doc, getDoc, setDoc } from "firebase/firestore";

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
    const [signInWithPopup, googleUser, googleLoading, googleError] = useSignInWithGoogle(auth);
    const [initialUser] = useAuthState(auth); // Check if a user is already logged in

    // Display error messages using toast notifications
    useEffect(() => {
        if (error || googleError) {
            const errorMessage = getErrorMessage(error || googleError); // Generate error message based on Firebase error codes
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive", // Styling for error notifications
            });
        }
    }, [error, googleError]);

    // Redirect to the home page if the user is already logged in
    useEffect(() => {
        if (initialUser || googleUser) {
            router.push("/"); // Navigate to the home page
        }
    }, [initialUser, googleUser, router]);

    // Prevent rendering the login page while redirecting
    if (initialUser || googleUser) {
        return null;
    }

    // Function to generate error messages based on Firebase error codes
    const getErrorMessage = (error: any) => {
        if (!error) return null; // Return null if there is no error
        switch (error.code) {
            case "auth/user-not-found":
                return "No user found with this email.";
            case "auth/invalid-credential":
                return "Invalid credentials. Please try again.";
            case "auth/too-many-requests":
                return "Too many login attempts. Please try again later.";
            default:
                return "An error occurred. Please try again.";
        }
    };

    // Form submission handler
    const onSubmit = async (data: LoginFormValues) => {
        try {
            await signInWithEmailAndPassword(data.email, data.password); // Attempt to log in the user
        } catch (e) {
            console.error(e); // Log any errors
        }
    };

    // Google login handler
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(); // Sign in with Google using a popup
            if (result) {
                const userId = result.user.uid; // Get the user's unique ID from Firebase Auth
                const userEmail = result.user.email; // Get the user's email

                // Check if the user already exists in the Firestore users collection
                const userDoc = await getDoc(doc(db, "users", userId));

                if (!userDoc.exists()) {
                    // Add the user's email to the Firestore users collection if not already present
                    await setDoc(doc(db, "users", userId), {
                        email: userEmail, // Store the user's email
                        createdAt: new Date(), // Optional: Add timestamp
                    });
                }

                toast({
                    title: "Success",
                    description: "Logged in successfully with Google.",
                    variant: "default", // Styling for success notifications
                });
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

                            {/* Google login button */}
                            <Button
                                onClick={handleGoogleLogin}
                                className="w-full mt-2 bg-gradient-to-r from-red-500 to-yellow-600"
                                disabled={googleLoading} // Disable the button while signing in with Google
                            >
                                {googleLoading ? "Signing in with Google..." : "Login with Google"}
                            </Button>
                        </div>
                    </form>
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