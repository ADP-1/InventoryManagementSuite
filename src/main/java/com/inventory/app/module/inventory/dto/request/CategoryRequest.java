package com.inventory.app.module.inventory.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    @Schema(example = "Electronics")
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    @Schema(example = "Electronic gadgets and accessories")
    private String description;
}
