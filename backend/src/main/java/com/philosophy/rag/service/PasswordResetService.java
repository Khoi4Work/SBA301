package com.philosophy.rag.service;

import com.philosophy.rag.dto.request.ForgotPasswordRequest;
import com.philosophy.rag.dto.request.ResetPasswordRequest;

public interface PasswordResetService {

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}