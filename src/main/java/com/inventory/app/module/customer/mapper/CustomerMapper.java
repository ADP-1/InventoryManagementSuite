package com.inventory.app.module.customer.mapper;

import com.inventory.app.module.customer.dto.request.CustomerRequest;
import com.inventory.app.module.customer.dto.response.CustomerResponse;
import com.inventory.app.module.customer.dto.response.CustomerSummaryResponse;
import com.inventory.app.module.customer.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface CustomerMapper {

    CustomerResponse toResponse(Customer customer);

    CustomerSummaryResponse toSummaryResponse(Customer customer);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", ignore = true)
    Customer toEntity(CustomerRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(CustomerRequest request, @MappingTarget Customer customer);
}
