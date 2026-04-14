package com.inventory.app.module.customer.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    @Schema(example = "Rahul Sharma")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    @Schema(example = "rahul@example.com")
    private String email;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Schema(example = "9876543210")
    private String phone;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    @Schema(example = "123 MG Road, New Delhi 110001")
    private String address;
}
