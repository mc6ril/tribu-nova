// import { useCallback, useEffect } from "react";
// import { SubmitHandler, useForm } from "react-hook-form";
// import { useTranslations } from "next-intl";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { PAGE_ROUTES } from "@/shared/constants";
// import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
// import Button from "@/shared/design-system/button";
// import Form from "@/shared/design-system/form";
// import Input from "@/shared/design-system/input";
// import Link from "@/shared/design-system/link";
// import Text from "@/shared/design-system/text";
// import Title from "@/shared/design-system/title";
// import { getAppErrorCode } from "@/shared/errors/appError";
// import { AUTH_ERROR_CODES } from "@/shared/errors/appErrorCodes";
// import { getErrorMessage } from "@/shared/i18n/errorMessages";
// import { useAppRouter } from "@/shared/navigation/useAppRouter";

// import styles from "./styles.module.scss";

// import { SignInInput } from "@/domains/auth/core/domain/auth.types";
// import { SignInSchema } from "@/domains/auth/core/usecases/user/signInUser";
// import { translateAuthFieldError } from "@/domains/auth/presentation/forms/authFieldErrors";

// type FormData = SignInInput;

// type SigninPageProps = {
//   redirectPath: string;
//   isUnverifiedRedirect: boolean;
// };

// const SigninPage = ({
//   redirectPath,
//   isUnverifiedRedirect,
// }: SigninPageProps) => {
//   const router = useAppRouter();
//   const t = useTranslations("auth.signin");
//   const tCommon = useTranslations("common");
//   const tErrors = useTranslations("errors");
//   const tFields = useTranslations("pages.signin.fields");

//   const signupHref =
//     redirectPath === PAGE_ROUTES.WORKSPACE
//       ? AUTH_PAGE_ROUTES.SIGNUP
//       : `${AUTH_PAGE_ROUTES.SIGNUP}?redirect=${encodeURIComponent(redirectPath)}`;

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setError,
//     clearErrors,
//     getValues,
//   } = useForm<FormData>({
//     resolver: zodResolver(SignInSchema),
//     mode: "onBlur",
//   });

//   useEffect(() => {
//     if (isUnverifiedRedirect) {
//       setError("root", {
//         type: "server",
//         message: tErrors("auth.EMAIL_VERIFICATION_ERROR"),
//       });
//     }
//   }, [isUnverifiedRedirect, setError, tErrors]);

//   useEffect(() => {
//     if (signInMutation.error) {
//       const code = getAppErrorCode(signInMutation.error);
//       const errorMessage = getErrorMessage(signInMutation.error, tErrors);

//       if (code === AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR) {
//         setError("root", {
//           type: "server",
//           message: errorMessage,
//         });
//       } else if (code === AUTH_ERROR_CODES.INVALID_CREDENTIALS) {
//         setError("root", {
//           type: "server",
//           message: errorMessage,
//         });
//       } else if (code === AUTH_ERROR_CODES.INVALID_EMAIL) {
//         setError("email", {
//           type: "server",
//           message: errorMessage,
//         });
//       } else {
//         setError("root", {
//           type: "server",
//           message: errorMessage,
//         });
//       }
//     }
//   }, [signInMutation.error, setError, tErrors]);

//   useEffect(() => {
//     if (resendVerificationMutation.isSuccess) {
//       setError("root", {
//         type: "server",
//         message: t("resendVerification.success"),
//       });
//     }
//   }, [resendVerificationMutation.isSuccess, setError, t]);

//   useEffect(() => {
//     if (signInWithGoogleMutation.error) {
//       setError("root", {
//         type: "server",
//         message: getErrorMessage(signInWithGoogleMutation.error, tErrors),
//       });
//     }
//   }, [signInWithGoogleMutation.error, setError, tErrors]);

//   useEffect(() => {
//     if (signInMutation.isSuccess && signInMutation.data) {
//       router.push(redirectPath);
//     }
//   }, [redirectPath, signInMutation.isSuccess, signInMutation.data, router]);

//   const onSubmit: SubmitHandler<FormData> = useCallback(
//     (data) => {
//       signInMutation.mutate(data);
//     },
//     [signInMutation]
//   );

//   const handleResendVerification = useCallback(() => {
//     const email = getValues("email");
//     if (email) {
//       resendVerificationMutation.mutate(email);
//     }
//   }, [getValues, resendVerificationMutation]);

//   const handleGoogleSignIn = useCallback(() => {
//     clearErrors("root");

//     signInWithGoogleMutation.mutate(redirectPath);
//   }, [clearErrors, redirectPath, signInWithGoogleMutation]);

//   const isEmailVerificationError =
//     isUnverifiedRedirect ||
//     getAppErrorCode(signInMutation.error) ===
//       AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR;

//   return (
//     <div className={styles["signin-page"]}>
//       <div className={styles["signin-container"]}>
//         <Title variant="h1" className={styles["signin-title"]}>
//           {t("title")}
//         </Title>
//         <Text variant="body" className={styles["signin-subtitle"]}>
//           {t("subtitle")}
//         </Text>

//         <Form
//           onSubmit={handleSubmit(onSubmit)}
//           className={styles["signin-form"]}
//           error={errors.root?.message}
//           noValidate
//         >
//           {isEmailVerificationError && errors.root && (
//             <div className={styles["signin-resend-verification"]}>
//               <Button
//                 label={
//                   resendVerificationMutation.isPending
//                     ? tCommon("loading")
//                     : t("resendVerification.button")
//                 }
//                 onClick={handleResendVerification}
//                 disabled={resendVerificationMutation.isPending}
//                 variant="secondary"
//                 type="button"
//                 aria-label={t("resendVerification.buttonAriaLabel")}
//               />
//             </div>
//           )}

//           <Input
//             label={tCommon("email")}
//             type="email"
//             autoComplete="email"
//             required
//             error={translateAuthFieldError(errors.email, tFields)}
//             {...register("email")}
//           />

//           <Input
//             label={tCommon("password")}
//             type="password"
//             autoComplete="current-password"
//             required
//             error={translateAuthFieldError(errors.password, tFields)}
//             {...register("password")}
//           />

//           <div className={styles["signin-forgot-password"]}>
//             <Link
//               href={AUTH_PAGE_ROUTES.RESET_PASSWORD}
//               className={styles["signin-link"]}
//             >
//               {t("forgotPassword")}
//             </Link>
//           </div>

//           <Button
//             label={t("button")}
//             type="submit"
//             fullWidth
//             disabled={signInMutation.isPending}
//             aria-label={t("buttonAriaLabel")}
//           />
//         </Form>

//         <div className={styles["signin-divider"]}>
//           <span>{t("oauth.divider")}</span>
//         </div>
//         <Button
//           label={t("oauth.googleButton")}
//           variant="secondary"
//           fullWidth
//           onClick={handleGoogleSignIn}
//           disabled={signInWithGoogleMutation.isPending}
//           aria-label={t("oauth.googleButtonAriaLabel")}
//         />

//         <Text variant="small" className={styles["signin-footer"]}>
//           {t("footer")}{" "}
//           <Link href={signupHref} className={styles["signin-link"]}>
//             {t("footerLink")}
//           </Link>
//         </Text>
//       </div>
//     </div>
//   );
// };

// export default SigninPage;
