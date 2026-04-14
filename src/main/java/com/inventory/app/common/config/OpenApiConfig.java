package com.inventory.app.common.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Inventory & Billing Management System API",
                version = "1.0.0",
                description = "Production-grade REST API for inventory and billing management",
                contact = @Contact(name = "API Support", email = "support@inventory.com"),
                license = @License(name = "Private", url = "https://inventory.com")
        ),
        servers = {
                @Server(url = "http://localhost:9090/api/v1", description = "Local Development"),
                @Server(url = "http://localhost:9090/api/v1", description = "Docker Environment")
        },
        security = {
                @SecurityRequirement(name = "bearerAuth")
        },
        tags = {
                @Tag(name = "Authentication", description = "Register, login, token management"),
                @Tag(name = "Users", description = "User management"),
                @Tag(name = "Categories", description = "Product category management"),
                @Tag(name = "Products", description = "Product and stock management"),
                @Tag(name = "Customers", description = "Customer management"),
                @Tag(name = "Invoices", description = "Billing and invoice lifecycle")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class OpenApiConfig {
}
