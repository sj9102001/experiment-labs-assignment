/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Indicates this component is client-side rendered
import Link from "next/link"; // Next.js link component for navigation
import { useRouter } from "next/navigation"; // Next.js router for programmatic navigation
import { useForm, SubmitHandler } from "react-hook-form"; // React Hook Form for form handling and validation
import { Button } from "@/components/ui/button"; // UI button component
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"; // Card components for layout
import { Input } from "@/components/ui/input"; // UI input component
import { Label } from "@/components/ui/label"; // UI label component

import { useAuthState, useCreateUserWithEmailAndPassword, useSignInWithGoogle } from "react-firebase-hooks/auth"; // Firebase hooks for authentication
import { auth, db } from "@/lib/firebase/config"; // Firebase authentication configuration
import { toast } from "@/hooks/use-toast"; // Custom toast hook for notifications
import { useEffect } from "react"; // React hook for side effects
import { doc, setDoc } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";

// Interface for form inputs
interface SignupFormInputs {
    email: string; // User's email
    password: string; // User's password
    confirmPassword: string; // Confirmation of user's password
}
// Main SignupPage component
const SignupPage = () => {
    // React Hook Form setup for form state and validation
    const {
        register, // Function to register inputs with React Hook Form
        handleSubmit, // Function to handle form submission
        formState: { errors, isSubmitting }, // Access validation errors and submission state
    } = useForm<SignupFormInputs>();

    const router = useRouter(); // Next.js router for navigation
    const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth); // Firebase hook to create a user
    const [signInWithGoogle, googleUser, googleLoading, googleError] = useSignInWithGoogle(auth); // Firebase hook for Google Sign-In
    const [currentUser] = useAuthState(auth); // Check if a user is already logged in

    // Redirect to the home page if the user is already logged in
    useEffect(() => {
        if (currentUser) {
            router.push("/"); // Navigate to the home page
        }
    }, [currentUser, router]);

    // Display error messages using toast notifications
    useEffect(() => {
        if (error || googleError) {
            const errorMessage = error
                ? getErrorMessage(error)
                : getErrorMessage(googleError);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive", // Styling for error notifications
            });
        }
    }, [error, googleError]);

    // Prevent rendering the signup page if the user is already logged in
    if (currentUser) {
        return null;
    }

    // Function to generate error messages based on Firebase error codes
    const getErrorMessage = (error: any) => {
        if (!error) return null;
        switch (error.code) {
            case "auth/email-already-in-use":
                return "Email is already in use. Please use a different email.";
            case "auth/invalid-email":
                return "Invalid email address. Please enter a valid email.";
            case "auth/weak-password":
                return "Password is too weak. Please use a stronger password.";
            default:
                return "An error occurred. Please try again.";
        }
    };

    // Form submission handler
    const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
        const { email, password, confirmPassword } = data;

        // Validate that the passwords match
        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(email, password); // Create user with Firebase

            if (!error && userCredential) {
                const userId = userCredential.user.uid; // Get the user's unique ID from Firebase Auth
                // Add the user's email to the Firestore users collection
                await setDoc(doc(db, "users", userId), {
                    email: email, // Store the user's email
                    createdAt: new Date(), // Optional: Add timestamp
                });
                toast({
                    title: "Success",
                    description: "Account created successfully. Redirecting to login...",
                    variant: "default", // Styling for success notifications
                });
            }
        } catch (e: any) {
            console.error(e); // Log any unexpected errors
        }
    };

    // Google Sign-In handler
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithGoogle(); // Perform Google sign-in
            if (result) {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const accessToken = credential?.accessToken;
                if (accessToken) {
                    localStorage.setItem("googleAccessToken", accessToken);
                }
                const userId = result.user.uid; // Get the user's unique ID from Firebase Auth
                const userEmail = result.user.email; // Get the user's email

                // Add the user's email to the Firestore users collection
                await setDoc(doc(db, "users", userId), {
                    email: userEmail, // Store the user's email
                    createdAt: new Date(), // Optional: Add timestamp
                });

                toast({
                    title: "Success",
                    description: "Signed up successfully with Google. Redirecting...",
                    variant: "default", // Styling for success notifications
                });

                router.push("/"); // Redirect to the homepage or another page
            }
        } catch (e: any) {
            console.error("Google Sign-In Error:", e);
            toast({
                title: "Error",
                description: "An error occurred during Google Sign-In. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <main className="flex h-screen w-full items-center bg-sidebar justify-center px-4">
            {/* Card layout for the signup form */}
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Signup</CardTitle>
                    <CardDescription>
                        Enter your email below to create a new account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        {/* Email input */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email", { required: "Email is required" })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        {/* Password input */}
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters.",
                                    },
                                })}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        {/* Confirm Password input */}
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword", {
                                    required: "Confirm Password is required.",
                                })}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing up..." : "Signup"}
                        </Button>
                    </form>
                    {/* Google Sign-In button */}
                    <Button
                        onClick={handleGoogleSignIn}
                        className="w-full mt-4 bg-gradient-to-r from-red-500 to-yellow-600"
                        disabled={googleLoading}
                    >
                        {googleLoading ? "Signing in with Google..." : "Sign Up with Google"}
                    </Button>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="underline">
                            Log in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
};

export default SignupPage;