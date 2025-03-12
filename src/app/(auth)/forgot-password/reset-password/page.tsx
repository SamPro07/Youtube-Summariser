"use client";

import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  return (
    <div>
      <h1>Reset Password</h1>
      {error && (
        <div style={{ color: "red" }}>
          <p><strong>Error:</strong> {error}</p>
          <p><strong>Code:</strong> {errorCode}</p>
          <p><strong>Description:</strong> {errorDescription}</p>
        </div>
      )}
      {/* Render your reset password form here */}
    </div>
  );
}