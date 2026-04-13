package com.inventory.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class InventoryBillingSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(InventoryBillingSystemApplication.class, args);
	}

}

