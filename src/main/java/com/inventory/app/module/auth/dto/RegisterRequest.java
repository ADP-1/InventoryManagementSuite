package com.inventory.app.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.inventory.app.module.user.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Schema(description = "Full name", example = "Rahul Sharma")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Schema(description = "Email address", example = "rahul@example.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(description = "Min 8 chars", example = "Admin@1234")
    private String password;

    @NotNull(message = "Role is required")
    @Schema(description = "User role", example = "ADMIN", allowableValues = {"ADMIN","MANAGER","CASHIER"})
    private Role role;
}
